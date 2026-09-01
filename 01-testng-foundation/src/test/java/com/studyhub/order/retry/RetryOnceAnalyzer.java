package com.studyhub.order.retry;

import org.testng.IRetryAnalyzer;
import org.testng.ITestResult;

/**
 * 只允许一次重试的本地重试策略。
 *
 * <p>重试适合网络抖动、临时服务不可用等已知的瞬时问题；断言错误、业务规则错误等稳定失败
 * 不应该靠重试掩盖。</p>
 */
public final class RetryOnceAnalyzer implements IRetryAnalyzer {
    private static final int MAX_RETRY_COUNT = 1;

    private int retryCount;

    @Override
    public boolean retry(ITestResult result) {
        if (retryCount >= MAX_RETRY_COUNT) {
            return false;
        }

        retryCount++;
        String methodName = result.getTestClass().getName()
                + "." + result.getMethod().getMethodName();
        String reason = result.getThrowable() == null
                ? "未知原因"
                : result.getThrowable().getMessage();

        System.out.println(
                "准备重试：" + methodName
                        + "，第 " + retryCount + "/" + MAX_RETRY_COUNT + " 次"
                        + "，原因：" + reason
        );
        return true;
    }
}
