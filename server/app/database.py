"""
数据库配置和模型
"""
from sqlalchemy import create_engine, Column, Integer, String, BigInteger, DateTime, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import os

# 数据库文件路径
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")

# 创建数据库引擎
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明基类
Base = declarative_base()

# 数据过期时间（天），默认 30 天
DATA_EXPIRY_DAYS = int(os.getenv("DATA_EXPIRY_DAYS", "30"))


class CollectedData(Base):
    """收集的数据模型"""
    __tablename__ = "collected_data"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(100), index=True, comment="设备ID")
    timestamp = Column(BigInteger, index=True, comment="数据时间戳（毫秒）")
    data = Column(JSON, comment="收集的数据内容")
    created_at = Column(DateTime, default=datetime.utcnow, comment="记录创建时间")
    
    # 创建复合索引以提高查询性能
    __table_args__ = (
        Index('idx_device_timestamp', 'device_id', 'timestamp'),
        Index('idx_created_at', 'created_at'),
    )


def init_db():
    """初始化数据库，创建表"""
    Base.metadata.create_all(bind=engine)
    print("数据库初始化完成")


def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def cleanup_expired_data():
    """清理过期数据"""
    db = SessionLocal()
    try:
        # 计算过期时间点
        expiry_date = datetime.utcnow() - timedelta(days=DATA_EXPIRY_DAYS)
        
        # 删除过期数据
        deleted_count = db.query(CollectedData).filter(
            CollectedData.created_at < expiry_date
        ).delete()
        
        db.commit()
        
        if deleted_count > 0:
            print(f"清理了 {deleted_count} 条过期数据")
        
        return deleted_count
    except Exception as e:
        db.rollback()
        print(f"清理过期数据时出错: {e}")
        return 0
    finally:
        db.close()

