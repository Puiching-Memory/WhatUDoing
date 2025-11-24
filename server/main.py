"""
FastAPI 服务器主文件
用于接收和存储 APP 收集的数据，并托管前端页面
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from pathlib import Path
from app.database import init_db, cleanup_expired_data
from app.routers import data, dashboard
from app.scheduler import start_scheduler, stop_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库和调度器
    init_db()
    start_scheduler()
    yield
    # 关闭时停止调度器
    stop_scheduler()

app = FastAPI(
    title="WhatUDoing Data Server",
    description="接收和存储 APP 收集的数据",
    version="1.0.0",
    lifespan=lifespan
)

# 配置 CORS，允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 获取 web 目录路径（相对于 server 目录）
BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR.parent / "web"

# 优先使用构建输出目录（生产环境）
WEB_BUILD_DIR = WEB_DIR / "unpackage" / "dist" / "build" / "web"

# 确定使用哪个目录（优先构建目录，不存在则使用源目录）
if WEB_BUILD_DIR.exists():
    STATIC_WEB_DIR = WEB_BUILD_DIR
    print(f"使用构建输出目录: {STATIC_WEB_DIR}")
else:
    STATIC_WEB_DIR = WEB_DIR
    print(f"使用源目录: {STATIC_WEB_DIR}")

# 注册 API 路由（必须在静态文件路由之前）
app.include_router(data.router, prefix="/api", tags=["data"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy"}

# 如果 web 目录存在，配置静态文件服务
if STATIC_WEB_DIR.exists():
    # 挂载静态资源目录
    static_dir = STATIC_WEB_DIR / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
    
    @app.get("/")
    async def root():
        """根路径 - 返回前端首页"""
        index_path = STATIC_WEB_DIR / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"message": "WhatUDoing Data Server", "status": "running", "web_dir": "not found"}
    
    # SPA 路由支持 - 所有非 API 路由都返回 index.html
    @app.get("/{path:path}")
    async def serve_spa(path: str):
        """
        处理前端路由（SPA）
        如果请求的不是 API 路径且文件不存在，返回 index.html
        """
        # 排除 API 路径和已挂载的静态路径
        if path.startswith("api/") or path.startswith("static/") or path == "health":
            raise HTTPException(status_code=404, detail="Not found")
        
        # 尝试查找文件
        file_path = STATIC_WEB_DIR / path
        
        # 如果是文件且存在，返回文件
        if file_path.is_file() and file_path.exists():
            # 检查文件是否在 web 目录内（安全）
            try:
                file_path.resolve().relative_to(STATIC_WEB_DIR.resolve())
            except ValueError:
                raise HTTPException(status_code=403, detail="Access denied")
            return FileResponse(str(file_path))
        
        # 如果是目录，尝试查找 index.html
        if file_path.is_dir():
            index_in_dir = file_path / "index.html"
            if index_in_dir.exists():
                return FileResponse(str(index_in_dir))
        
        # 对于 SPA 路由，返回主 index.html
        index_path = STATIC_WEB_DIR / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        
        raise HTTPException(status_code=404, detail="File not found")
else:
    @app.get("/")
    async def root():
        """根路径"""
        return {"message": "WhatUDoing Data Server", "status": "running", "web_dir": "not found"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

