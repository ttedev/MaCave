package fr.ttelab.vin.vin_back.controller;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Slf4j
public class ForwardController {



  @GetMapping("/caves")
  public String caves(HttpServletRequest request) {
    return  "forward:/index.html" ;
  }

  @GetMapping("/login")
  public String login(HttpServletRequest request) {
    return  "forward:/index.html" ;
  }

  @GetMapping("/caves/{id}")
  public String caveDetails(HttpServletRequest request) {
    return  "forward:/index.html" ;
  }






}
