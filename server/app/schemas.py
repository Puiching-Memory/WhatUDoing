"""
Pydantic 数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class DataSubmission(BaseModel):
    """数据提交模型"""
    device_id: Optional[str] = Field(None, description="设备ID，可选")
    timestamp: int = Field(..., description="数据时间戳（毫秒）")
    data: Dict[str, Any] = Field(..., description="收集的数据内容")
    
    class Config:
        json_schema_extra = {
            "example": {
                "device_id": "device_123",
                "timestamp": 1699123456789,
                "data": {
                    "battery": {"level": 80},
                    "location": {"latitude": 39.9, "longitude": 116.4},
                    "timestamp": 1699123456789
                }
            }
        }


class DataResponse(BaseModel):
    """数据响应模型"""
    id: int
    device_id: Optional[str]
    timestamp: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class SuccessResponse(BaseModel):
    """成功响应模型"""
    success: bool = True
    message: str = "数据保存成功"
    id: Optional[int] = None

