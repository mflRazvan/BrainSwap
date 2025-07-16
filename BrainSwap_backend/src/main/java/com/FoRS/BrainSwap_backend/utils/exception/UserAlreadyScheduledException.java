package com.FoRS.BrainSwap_backend.utils.exception;

public class UserAlreadyScheduledException extends RuntimeException {
    public UserAlreadyScheduledException(String message) {
        super(message);
    }
}
