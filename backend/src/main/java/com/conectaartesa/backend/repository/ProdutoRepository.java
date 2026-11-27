package com.conectaartesa.backend.repository;

import com.conectaartesa.backend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    boolean existsByCategoria(String categoria);
}
