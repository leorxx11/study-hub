package listener;

import org.testng.ITestListener;
import org.testng.ITestResult;

public class MyTestListener implements ITestListener {

    @Override
    public void onTestStart(ITestResult result) {
        log("测试开始", result);
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        log("测试成功", result);
    }

    @Override
    public void onTestFailure(ITestResult result) {
        log("测试失败", result);
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        log("测试跳过", result);
    }

    private void log(String event, ITestResult result) {
        String threadName = Thread.currentThread().getName();
        String scenarioName = result.getTestName();
        String methodName = result.getMethod().getMethodName();
        String displayName = scenarioName == null || scenarioName.isBlank()
                ? methodName
                : scenarioName + "（" + methodName + "）";
        Throwable throwable = result.getThrowable();
        String reason = throwable == null || throwable.getMessage() == null
                ? ""
                : "，原因：" + throwable.getMessage();

        System.out.println("[" + threadName + "] " + event + "：" + displayName + reason);
    }
}
