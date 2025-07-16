package com.FoRS.BrainSwap_backend.utils.exception;

public class CallFullException extends RuntimeException{
    public CallFullException(String message){
        super(message);
    }
}
