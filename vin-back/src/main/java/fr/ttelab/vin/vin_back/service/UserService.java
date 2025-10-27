package fr.ttelab.vin.vin_back.service;

import fr.ttelab.vin.vin_back.model.User;
import fr.ttelab.vin.vin_back.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private UserRepository userRepository;
    
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Récupère l'utilisateur courant à partir du contexte de sécurité
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            // Pour les tests, retournons le premier utilisateur ou créons un utilisateur par défaut
            return getDefaultUser();
        }
        
        String username = authentication.getName();
        Optional<User> user = userRepository.findByUsername(username);
        
        return user.orElse(getDefaultUser());
    }

    /**
     * Récupère l'ID de l'utilisateur courant
     */
    public Long getCurrentUserId() {
        User currentUser = getCurrentUser();
        return currentUser != null ? currentUser.getId() : null;
    }

    /**
     * Crée ou récupère un utilisateur par défaut pour les tests
     */
    private User getDefaultUser() {
        Optional<User> defaultUser = userRepository.findByUsername("admin");
        
        if (defaultUser.isPresent()) {
            return defaultUser.get();
        }
        
        // Créer un utilisateur par défaut s'il n'existe pas
        User user = new User("admin", "admin@example.com", "password");
        user.setFirstName("Admin");
        user.setLastName("User");
        
        return userRepository.save(user);
    }

    /**
     * Trouve un utilisateur par username
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Sauvegarde un utilisateur
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Crée un nouvel utilisateur avec mot de passe encodé
     */
    public User createUser(User user) {
        // Encoder le mot de passe avant de sauvegarder
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Vérifie si un username existe déjà
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Vérifie si un email existe déjà
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}