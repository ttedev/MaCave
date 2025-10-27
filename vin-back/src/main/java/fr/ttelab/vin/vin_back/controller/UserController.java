package fr.ttelab.vin.vin_back.controller;

import fr.ttelab.vin.vin_back.config.JwtUtil;
import fr.ttelab.vin.vin_back.dto.UserDto;
import fr.ttelab.vin.vin_back.dto.UserRegistrationDto;
import fr.ttelab.vin.vin_back.dto.DtoMapper;
import fr.ttelab.vin.vin_back.model.User;
import fr.ttelab.vin.vin_back.security.CustomUserDetailsService;
import fr.ttelab.vin.vin_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;



     @Autowired
     private AuthenticationManager authenticationManager;

         @Autowired
         private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody User user) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );
        if(authentication.isAuthenticated()){

return ResponseEntity.ok(Map.of("token", jwtUtil.generateToken(user.getUsername())));
            }
        return ResponseEntity.status(403).body("User do not Exist");
    }

    /**
     * GET /api/users/current - Récupérer l'utilisateur courant
     */
    @GetMapping("/current")
    public ResponseEntity<UserDto> getCurrentUser() {
        User currentUser = userService.getCurrentUser();
        if (currentUser != null) {
            return ResponseEntity.ok(DtoMapper.toUserDto(currentUser));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * PUT /api/users/current - Mettre à jour les informations de l'utilisateur courant
     */
    @PutMapping("/current")
    public ResponseEntity<UserDto> updateCurrentUser(@RequestBody UserDto userDetails) {
        User currentUser = userService.getCurrentUser();
        if (currentUser != null) {
            currentUser.setFirstName(userDetails.getFirstName());
            currentUser.setLastName(userDetails.getLastName());
            currentUser.setEmail(userDetails.getEmail());
            User updatedUser = userService.saveUser(currentUser);
            return ResponseEntity.ok(DtoMapper.toUserDto(updatedUser));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * POST /api/users/register - Créer un nouvel utilisateur (registration)
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto user) {
        if (userService.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Erreur: Ce nom d'utilisateur est déjà pris!");
        }
        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Erreur: Cet email est déjà utilisé!");
        }
        User newUser = new User(user.getUsername(), user.getEmail(), user.getPassword());
        newUser.setFirstName(user.getFirstName());
        newUser.setLastName(user.getLastName());
        User savedUser = userService.createUser(newUser);
        return ResponseEntity.ok(DtoMapper.toUserDto(savedUser));
    }

}