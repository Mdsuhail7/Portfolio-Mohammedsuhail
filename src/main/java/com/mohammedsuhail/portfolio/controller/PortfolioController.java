package com.mohammedsuhail.portfolio.controller;

import com.mohammedsuhail.portfolio.dto.ContactRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import org.springframework.core.io.FileSystemResource;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Controller
public class PortfolioController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/what-i-do")
    public String whatIDo() {
        return "what-i-do";
    }

    @GetMapping("/projects")
    public String projects() {
        return "projects";
    }

    @GetMapping("/experience")
    public String experience() {
        return "experience";
    }

    @GetMapping("/about")
    public String about() {
        return "about";
    }

    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }

    @GetMapping("/resume")
    public ResponseEntity<Resource> downloadResume() {
        try {
            String[] candidates = {
                "static/resume/Mohammed-Suhail-Resume.pdf",
                "static/resume/Mohammed-Suhail-Resume.pdf.pdf",
                "static/resume/MOHAMMED SUHAIL A (3).pdf",
                "static/resume/resume.pdf"
            };

            Resource resource = null;
            for (String path : candidates) {
                Resource r = new ClassPathResource(path);
                if (r.exists()) {
                    resource = r;
                    break;
                }
            }

            // Direct filesystem check if classpath hasn't hot-reloaded yet
            if (resource == null || !resource.exists()) {
                File dir = new File("src/main/resources/static/resume");
                if (dir.exists() && dir.isDirectory()) {
                    File[] files = dir.listFiles((d, name) -> name.toLowerCase().endsWith(".pdf"));
                    if (files != null && files.length > 0) {
                        resource = new FileSystemResource(files[0]);
                    }
                }
            }

            if (resource == null || !resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Mohammed-Suhail-Resume.pdf\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/contact")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> submitContact(@Valid @RequestBody ContactRequest contactRequest, BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> {
                errors.put(error.getField(), error.getDefaultMessage());
            });
            response.put("success", false);
            response.put("errors", errors);
            return ResponseEntity.badRequest().body(response);
        }

        // Output request detail to console for verification / mock email service
        System.out.println("New Contact Message Received:");
        System.out.println("Name: " + contactRequest.getName());
        System.out.println("Email: " + contactRequest.getEmail());
        System.out.println("Message: " + contactRequest.getMessage());

        response.put("success", true);
        response.put("message", "Thank you, " + contactRequest.getName() + "! Your message has been received successfully.");
        return ResponseEntity.ok(response);
    }
}
