package br.edu.ufape.roomie.service;

import br.edu.ufape.roomie.dto.UserDTO;
import br.edu.ufape.roomie.dto.UserResponseDTO;
import br.edu.ufape.roomie.model.User;
import br.edu.ufape.roomie.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.stream.Collectors;

@Service
public class AuthService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username);
    }

    public UserResponseDTO register(UserDTO userDTO) {
        if (this.userRepository.findByEmail(userDTO.getEmail()) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado!");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(userDTO.getPassword());
        User newUser = new User(userDTO.getName(), userDTO.getEmail(), encryptedPassword, userDTO.getGender(), userDTO.getRole());
        if (userDTO.getPhones() != null){
            for(String numero : userDTO.getPhones()){
                newUser.addTelefone(numero);
            }
        }
        User savedUser = this.userRepository.save(newUser);

        UserResponseDTO response = new UserResponseDTO();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setGender(savedUser.getGender());
        response.setRole(savedUser.getRole());

        if (savedUser.getTelefones() != null) {
            response.setPhones(savedUser.getTelefones().stream()
                    .map(telefone -> telefone.getNumero())
                    .collect(Collectors.toList()));
        }

        return response;
    }
}