package listener;

import org.testng.IInvokedMethod;
import org.testng.IInvokedMethodListener;
import org.testng.ITestResult;

/**
 * 观察每一次方法调用，包括 {@code @Before*}、{@code @Test} 与 {@code @After*}。
 */
public final class MethodTraceListener implements IInvokedMethodListener {

    @Override
    public void beforeInvocation(IInvokedMethod method, ITestResult result) {
        log("调用前", method);
    }

    @Override
    public void afterInvocation(IInvokedMethod method, ITestResult result) {
        log("调用后", method);
    }

    private void log(String phase, IInvokedMethod method) {
        String methodType = method.isConfigurationMethod()
                ? "配置方法"
                : method.isTestMethod() ? "测试方法" : "其他方法";
        String methodName = method.getTestMethod().getMethodName();
        String threadName = Thread.currentThread().getName();

        System.out.println(
                "[" + threadName + "] " + phase
                        + " [" + methodType + "] " + methodName
        );
    }
}
