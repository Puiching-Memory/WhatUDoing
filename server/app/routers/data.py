"""
数据路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db, CollectedData
from app.schemas import DataSubmission, SuccessResponse, DataResponse

router = APIRouter()


@router.post("/submit", response_model=SuccessResponse)
async def submit_data(
    submission: DataSubmission,
    db: Session = Depends(get_db)
):
    """
    接收并存储收集的数据
    
    - **device_id**: 设备ID（可选）
    - **timestamp**: 数据时间戳（毫秒）
    - **data**: 收集的数据内容
    """
    try:
        # 创建数据记录
        db_data = CollectedData(
            device_id=submission.device_id,
            timestamp=submission.timestamp,
            data=submission.data,
            created_at=datetime.utcnow()
        )
        
        db.add(db_data)
        db.commit()
        db.refresh(db_data)
        
        return SuccessResponse(
            message="数据保存成功",
            id=db_data.id
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"保存数据失败: {str(e)}")


@router.get("/data", response_model=list[DataResponse])
async def get_data(
    device_id: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    查询数据
    
    - **device_id**: 设备ID（可选，用于筛选）
    - **limit**: 返回记录数限制（默认100）
    - **offset**: 偏移量（默认0）
    """
    try:
        query = db.query(CollectedData)
        
        if device_id:
            query = query.filter(CollectedData.device_id == device_id)
        
        data_list = query.order_by(CollectedData.created_at.desc()).offset(offset).limit(limit).all()
        
        return data_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询数据失败: {str(e)}")


@router.get("/data/{data_id}", response_model=DataResponse)
async def get_data_by_id(
    data_id: int,
    db: Session = Depends(get_db)
):
    """
    根据ID查询单条数据
    """
    data = db.query(CollectedData).filter(CollectedData.id == data_id).first()
    
    if not data:
        raise HTTPException(status_code=404, detail="数据不存在")
    
    return data


@router.delete("/data/{data_id}")
async def delete_data(
    data_id: int,
    db: Session = Depends(get_db)
):
    """
    删除指定ID的数据
    """
    data = db.query(CollectedData).filter(CollectedData.id == data_id).first()
    
    if not data:
        raise HTTPException(status_code=404, detail="数据不存在")
    
    try:
        db.delete(data)
        db.commit()
        return {"success": True, "message": "数据删除成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"删除数据失败: {str(e)}")


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    获取数据统计信息
    """
    try:
        total_count = db.query(CollectedData).count()
        
        # 按设备分组统计
        from sqlalchemy import func
        device_stats = db.query(
            CollectedData.device_id,
            func.count(CollectedData.id).label('count')
        ).group_by(CollectedData.device_id).all()
        
        return {
            "total_count": total_count,
            "device_stats": [
                {"device_id": stat.device_id, "count": stat.count}
                for stat in device_stats
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")

