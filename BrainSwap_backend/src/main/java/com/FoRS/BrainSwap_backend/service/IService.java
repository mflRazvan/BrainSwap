package com.FoRS.BrainSwap_backend.service;


import java.util.List;
import java.util.Optional;

public interface IService<C, G, U, ID> {
    G save(C entity);
    List<G> findAll();
    Optional<G> findById(ID id);
    G update(U entity);
    void deleteById(ID id);
}