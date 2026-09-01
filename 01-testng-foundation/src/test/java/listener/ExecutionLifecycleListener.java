package listener;

import org.testng.IExecutionListener;

/**
 * 观察整个 TestNG 进程的开始与结束。
 */
public final class ExecutionLifecycleListener implements IExecutionListener {

    @Override
    public void onExecutionStart() {
        System.out.println("=== TestNG 整体执行开始 ===");
    }

    @Override
    public void onExecutionFinish() {
        System.out.println("=== TestNG 整体执行结束 ===");
    }
}
