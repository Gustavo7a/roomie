package br.edu.ufape.roomie.repository;

import br.edu.ufape.roomie.model.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByCpf(String cpf); 
}
