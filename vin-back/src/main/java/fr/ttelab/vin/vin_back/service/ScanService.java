package fr.ttelab.vin.vin_back.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.spring.vision.CloudVisionTemplate;
import fr.ttelab.vin.vin_back.dto.WineDto;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

@Service
@Slf4j
public class ScanService {

  private final String PROMPT ="Tu es un assistant sommelier. À partir du texte d'une étiquette de vin ci-dessous, extrait uniquement:\n"
      + "chateau (nom du domaine ou château), appellation (AOC/AOP), annee (millésime 4 chiffres)  et fait une estimation du prix en euros\n"
      + "Réponds STRICTEMENT par un JSON compact sans commentaires, format:\n"
      + "{{\"chateau\":\"...\",\"appellation\":\"...\",\"annee\":\"...\",\"prix\":\"...\"}}\n"
      + "Si une info introuvable mets chaîne vide. Les deux chant texte doivent commencer par une majuscule puis en minuscule il peut y avoir des espaces\n"
      + "il peux y avoir des faute d'OCR  example Vetrus pour Petrus. annee et prix doivent etre des nombre sans double quotes dasn le JSON\n"
      + "s'il y a plusieurs année prend la dernière";

  @Autowired
  private CloudVisionTemplate cloudVisionTemplate;


  @Autowired
  private ChatModel chatClient;


  @Autowired
  private ResourceLoader resourceLoader;


  public WineDto scanWineLabel(MultipartFile file) throws IOException {


    File tempFile = File.createTempFile("upload-", file.getOriginalFilename());
    file.transferTo(tempFile);

    BufferedImage originalImage = ImageIO.read(tempFile);
    int maxWidth = 1024;
    if (originalImage.getWidth() > maxWidth) {
      int newHeight = (int) (((double) maxWidth / originalImage.getWidth()) * originalImage.getHeight());
      BufferedImage resizedImage = new BufferedImage(maxWidth, newHeight, BufferedImage.TYPE_INT_RGB);
      Graphics2D g = resizedImage.createGraphics();
      g.drawImage(originalImage, 0, 0, maxWidth, newHeight, null);
      g.dispose();
      File resizedFile = File.createTempFile("resized-", file.getOriginalFilename());
      ImageIO.write(resizedImage, "jpg", resizedFile);
      tempFile.delete();
      tempFile = resizedFile;
    }



    // Wrap the file as a Spring Resource
    Resource imageResource = new FileSystemResource(tempFile);

    // Extract text using Vision API
    String extractedText = cloudVisionTemplate.extractTextFromImage(imageResource);

    // Clean up
    tempFile.delete();


    log.info("Extracted Text: {}", extractedText);
    //TODO change it
    String reponse = chatClient.call(PROMPT+"\nTexte de l'étiquette:\n"+extractedText);
    //String reponse = "{\"chateau\":\"Château Margaux\",\"appellation\":\"Margaux AOC\",\"annee\":\"2015\",\"prix\":\"250.00\",\"couleur\":\"ROUGE\",\"taille\":\"750ml\"}";
    log.info("ChatGPT Response: {}", reponse);
    ObjectMapper objectMapper = new  ObjectMapper();
    return objectMapper.readValue(reponse,WineDto.class);

  }
}
