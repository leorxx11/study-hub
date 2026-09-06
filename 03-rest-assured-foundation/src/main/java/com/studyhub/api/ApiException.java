package com.studyhub.api;

/** 将接口契约中的失败结果传递给 HTTP 层。 */
public final class ApiException extends RuntimeException {
    private final int statusCode;
    private final String code;

    public ApiException(int statusCode, String code, String message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }

    public int statusCode() {
        return statusCode;
    }

    public String code() {
        return code;
    }
}
