"""
数据大屏路由
提供数据可视化和统计分析 API
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db, CollectedData

router = APIRouter()


@router.get("/latest")
async def get_latest_data(
    device_id: str = Query(None, description="设备ID（可选）"),
    db: Session = Depends(get_db)
):
    """
    获取最新的设备数据
    
    - **device_id**: 设备ID（可选，不提供则返回所有设备的最新数据）
    """
    try:
        query = db.query(CollectedData)
        
        if device_id:
            query = query.filter(CollectedData.device_id == device_id)
        
        latest_data = query.order_by(CollectedData.created_at.desc()).first()
        
        if not latest_data:
            return {
                "device_id": None,
                "timestamp": None,
                "created_at": None,
                "data": None
            }
        
        return {
            "device_id": latest_data.device_id,
            "timestamp": latest_data.timestamp,
            "created_at": latest_data.created_at.isoformat() if latest_data.created_at else None,
            "data": latest_data.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取最新数据失败: {str(e)}")


@router.get("/overview")
async def get_overview(
    hours: int = Query(24, description="统计最近N小时的数据"),
    db: Session = Depends(get_db)
):
    """
    获取数据概览统计
    
    - **hours**: 统计最近N小时的数据（默认24小时）
    """
    try:
        # 计算时间范围
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # 总数据量
        total_count = db.query(CollectedData).count()
        
        # 最近N小时的数据量
        recent_count = db.query(CollectedData).filter(
            CollectedData.created_at >= start_time
        ).count()
        
        # 活跃设备数
        active_devices = db.query(CollectedData.device_id).filter(
            CollectedData.created_at >= start_time
        ).distinct().count()
        
        # 总设备数
        total_devices = db.query(CollectedData.device_id).distinct().count()
        
        # 最新数据时间
        latest_data = db.query(CollectedData).order_by(
            CollectedData.created_at.desc()
        ).first()
        latest_time = latest_data.created_at if latest_data else None
        
        return {
            "total_count": total_count,
            "recent_count": recent_count,
            "active_devices": active_devices,
            "total_devices": total_devices,
            "latest_time": latest_time.isoformat() if latest_time else None,
            "time_range": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取概览数据失败: {str(e)}")


@router.get("/timeline")
async def get_timeline(
    hours: int = Query(24, description="统计最近N小时的数据"),
    interval: str = Query("hour", description="时间间隔：hour/day"),
    db: Session = Depends(get_db)
):
    """
    获取时间序列数据
    
    - **hours**: 统计最近N小时的数据（默认24小时）
    - **interval**: 时间间隔，hour 或 day
    """
    try:
        # 计算时间范围
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # 根据间隔类型分组
        if interval == "hour":
            # 按小时分组
            query = db.query(
                func.strftime('%Y-%m-%d %H:00:00', CollectedData.created_at).label('time'),
                func.count(CollectedData.id).label('count')
            ).filter(
                CollectedData.created_at >= start_time
            ).group_by('time').order_by('time')
        else:
            # 按天分组
            query = db.query(
                func.date(CollectedData.created_at).label('time'),
                func.count(CollectedData.id).label('count')
            ).filter(
                CollectedData.created_at >= start_time
            ).group_by('time').order_by('time')
        
        results = query.all()
        
        return {
            "timeline": [
                {
                    "time": str(result.time),
                    "count": result.count
                }
                for result in results
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间序列数据失败: {str(e)}")


@router.get("/devices")
async def get_devices_stats(
    limit: int = Query(10, description="返回前N个设备"),
    db: Session = Depends(get_db)
):
    """
    获取设备统计信息
    
    - **limit**: 返回前N个设备（默认10）
    """
    try:
        from sqlalchemy import desc
        
        # 按设备分组统计
        device_stats = db.query(
            CollectedData.device_id,
            func.count(CollectedData.id).label('count'),
            func.max(CollectedData.created_at).label('last_seen')
        ).group_by(CollectedData.device_id).order_by(
            desc('count')
        ).limit(limit).all()
        
        return {
            "devices": [
                {
                    "device_id": stat.device_id,
                    "count": stat.count,
                    "last_seen": stat.last_seen.isoformat() if stat.last_seen else None
                }
                for stat in device_stats
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取设备统计失败: {str(e)}")


@router.get("/battery")
async def get_battery_stats(
    hours: int = Query(24, description="统计最近N小时的数据"),
    interval: str = Query("hour", description="时间间隔：'hour' 或 'day'"),
    db: Session = Depends(get_db)
):
    """
    获取电量时间序列数据
    
    - **hours**: 统计最近N小时的数据（默认24小时）
    - **interval**: 时间间隔：'hour' 或 'day'（默认 'hour'）
    """
    try:
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        # 查询最近的数据，按时间排序
        recent_data = db.query(CollectedData).filter(
            CollectedData.created_at >= start_time
        ).order_by(CollectedData.created_at.asc()).all()
        
        # 收集电量数据点
        battery_points = []
        for record in recent_data:
            if record.data and isinstance(record.data, dict):
                battery = record.data.get('battery')
                if battery and isinstance(battery, dict):
                    level = battery.get('level')
                    if level is not None:
                        battery_points.append({
                            "time": record.created_at.isoformat() if record.created_at else None,
                            "timestamp": record.timestamp,
                            "level": level,
                            "isCharging": battery.get('isCharging', False)
                        })
        
        # 如果数据点太多，进行采样（每N个点取一个）
        max_points = 100
        if len(battery_points) > max_points:
            step = len(battery_points) // max_points
            battery_points = battery_points[::step]
        
        return {
            "points": battery_points,
            "count": len(battery_points),
            "stats": {
                "min": min([p["level"] for p in battery_points]) if battery_points else 0,
                "max": max([p["level"] for p in battery_points]) if battery_points else 0,
                "avg": round(sum([p["level"] for p in battery_points]) / len(battery_points), 2) if battery_points else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取电量统计失败: {str(e)}")


@router.get("/location")
async def get_location_stats(
    hours: int = Query(24, description="统计最近N小时的数据"),
    db: Session = Depends(get_db)
):
    """
    获取位置统计信息
    
    - **hours**: 统计最近N小时的数据（默认24小时）
    """
    try:
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        # 查询最近的数据
        recent_data = db.query(CollectedData).filter(
            CollectedData.created_at >= start_time
        ).all()
        
        locations = []
        for record in recent_data:
            if record.data and isinstance(record.data, dict):
                location = record.data.get('location')
                if location and isinstance(location, dict):
                    lat = location.get('latitude')
                    lng = location.get('longitude')
                    if lat is not None and lng is not None:
                        locations.append({
                            "latitude": lat,
                            "longitude": lng,
                            "timestamp": record.timestamp
                        })
        
        return {
            "count": len(locations),
            "locations": locations[:1000]  # 限制返回数量，避免数据过大
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取位置统计失败: {str(e)}")


@router.get("/network")
async def get_network_stats(
    hours: int = Query(24, description="统计最近N小时的数据"),
    db: Session = Depends(get_db)
):
    """
    获取网络信号强度时间序列数据
    
    - **hours**: 统计最近N小时的数据（默认24小时）
    """
    try:
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        # 查询最近的数据，按时间排序
        recent_data = db.query(CollectedData).filter(
            CollectedData.created_at >= start_time
        ).order_by(CollectedData.created_at.asc()).all()
        
        # 收集信号强度数据点
        signal_points = []
        for record in recent_data:
            if record.data and isinstance(record.data, dict):
                network_info = record.data.get('networkInfo')
                if network_info and isinstance(network_info, dict):
                    wifi_info = network_info.get('wifiInfo')
                    if wifi_info and isinstance(wifi_info, dict):
                        signal_strength = wifi_info.get('signalStrength')
                        if signal_strength is not None:
                            signal_points.append({
                                "time": record.created_at.isoformat() if record.created_at else None,
                                "timestamp": record.timestamp,
                                "signalStrength": signal_strength,
                                "ssid": wifi_info.get('ssid', 'N/A'),
                                "networkType": network_info.get('networkType', 'N/A')
                            })
        
        # 如果数据点太多，进行采样（每N个点取一个）
        max_points = 100
        if len(signal_points) > max_points:
            step = len(signal_points) // max_points
            signal_points = signal_points[::step]
        
        return {
            "points": signal_points,
            "count": len(signal_points),
            "stats": {
                "min": min([p["signalStrength"] for p in signal_points]) if signal_points else 0,
                "max": max([p["signalStrength"] for p in signal_points]) if signal_points else 0,
                "avg": round(sum([p["signalStrength"] for p in signal_points]) / len(signal_points), 2) if signal_points else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取网络统计失败: {str(e)}")


@router.get("/apps")
async def get_apps_stats(
    hours: int = Query(24, description="统计最近N小时的数据"),
    limit: int = Query(10, description="返回前N个应用"),
    db: Session = Depends(get_db)
):
    """
    获取应用使用统计
    
    - **hours**: 统计最近N小时的数据（默认24小时）
    - **limit**: 返回前N个应用（默认10）
    """
    try:
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        # 查询最近的数据
        recent_data = db.query(CollectedData).filter(
            CollectedData.created_at >= start_time
        ).all()
        
        app_usage = {}
        
        for record in recent_data:
            if record.data and isinstance(record.data, dict):
                foreground_app = record.data.get('foregroundApp')
                if foreground_app and isinstance(foreground_app, dict):
                    # 根据 ForegroundAppCollector 的实现，主要字段是 packageName
                    # 尝试多种可能的字段名（按优先级）
                    app_name = (
                        foreground_app.get('packageName') or  # 主要字段
                        foreground_app.get('package_name') or
                        foreground_app.get('appName') or 
                        foreground_app.get('name') or 
                        foreground_app.get('app_name')
                    )
                    # 如果 packageName 是 'N/A'，跳过
                    if app_name and app_name != 'N/A':
                        app_usage[app_name] = app_usage.get(app_name, 0) + 1
        
        # 排序并取前N个
        top_apps = sorted(
            app_usage.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        # 调试：如果没有数据，返回一些调试信息
        if not top_apps and recent_data:
            import logging
            # 检查第一条数据的内容
            sample_data = recent_data[0].data if recent_data else {}
            logging.debug(f"应用数据为空，但存在 {len(recent_data)} 条记录。示例数据: {sample_data}")
            # 检查是否有 foregroundApp 字段
            if sample_data and isinstance(sample_data, dict):
                logging.debug(f"foregroundApp 字段: {sample_data.get('foregroundApp')}")
        
        return {
            "apps": [
                {"name": k, "count": v}
                for k, v in top_apps
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取应用统计失败: {str(e)}")

