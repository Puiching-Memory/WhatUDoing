"""
定时任务调度器
用于定期清理过期数据
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.database import cleanup_expired_data
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

scheduler = None


def cleanup_job():
    """清理过期数据的任务"""
    try:
        deleted_count = cleanup_expired_data()
        logger.info(f"定时清理任务完成，删除了 {deleted_count} 条过期数据")
    except Exception as e:
        logger.error(f"定时清理任务出错: {e}")


def start_scheduler():
    """启动调度器"""
    global scheduler
    
    if scheduler is not None:
        logger.warning("调度器已经启动")
        return
    
    scheduler = BackgroundScheduler()
    
    # 每天凌晨2点执行清理任务
    scheduler.add_job(
        cleanup_job,
        trigger=IntervalTrigger(hours=24),  # 每24小时执行一次
        id='cleanup_expired_data',
        name='清理过期数据',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("调度器已启动，将每天执行一次过期数据清理")


def stop_scheduler():
    """停止调度器"""
    global scheduler
    
    if scheduler is not None:
        scheduler.shutdown()
        scheduler = None
        logger.info("调度器已停止")

