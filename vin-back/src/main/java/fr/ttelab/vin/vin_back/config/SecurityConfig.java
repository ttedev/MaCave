package fr.ttelab.vin.vin_back.config;

import fr.ttelab.vin.vin_back.security.CustomUserDetailsService;
import fr.ttelab.vin.vin_back.service.CustomOidcUserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.ForwardedHeaderFilter;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Autowired
  private JwtUtil jwtUtil;
  @Autowired
  private CustomUserDetailsService customUserDetailsService;
  @Autowired
  private CustomOidcUserService customOidcUserService;

  @Bean
  public PasswordEncoder passwordEncoder() {return new BCryptPasswordEncoder();}

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {return config.getAuthenticationManager();}

  @Bean
  public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder);
    return provider;
  }

  @Bean
  public ForwardedHeaderFilter forwardedHeaderFilter() {return new ForwardedHeaderFilter();}

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationProvider authenticationProvider) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(authz -> authz
            // --- Front (SPA) et statiques ---
            .requestMatchers(
                "/",
                "login",
                "caves/**",
                "/index.html",
                "/favicon.ico",
                "/assets/**"          // ton dossier d’assets React (adapter au build: /static/**, /js/**, /css/**, etc.)

            ).permitAll()

            // --- Endpoints d’accès public backend ---
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/api/users/register").permitAll()
            .requestMatchers("/api/users/login").permitAll()
            .requestMatchers("/auth/**").permitAll()
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers("/h2-console/**").permitAll()
            .requestMatchers("/error").permitAll()

            // --- Tout le reste nécessite auth ---
            .anyRequest().authenticated()
        )
        .authenticationProvider(authenticationProvider)
        .oauth2Login(oauth2 -> oauth2
            .loginPage("/login")
            .userInfoEndpoint(userInfo -> userInfo.oidcUserService(customOidcUserService))
            .successHandler((request, response, authentication) -> {
              OidcUser user = (OidcUser) authentication.getPrincipal();
              String token = jwtUtil.generateToken(user.getEmail());
              String redirectUrl = "/login?token=" + token;
              log.debug("OAuth2 success redirect -> {}", redirectUrl);
              response.sendRedirect(redirectUrl);
            })
        );

    http.formLogin(AbstractHttpConfigurer::disable);
    http.httpBasic(AbstractHttpConfigurer::disable);
    // H2 console
    http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

    http.addFilterBefore(new JwtRequestFilter(jwtUtil, customUserDetailsService), UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}