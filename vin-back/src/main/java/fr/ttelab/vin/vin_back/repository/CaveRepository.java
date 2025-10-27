package fr.ttelab.vin.vin_back.repository;

import fr.ttelab.vin.vin_back.model.Cave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaveRepository extends JpaRepository<Cave, Long> {
    
    List<Cave> findByNomContainingIgnoreCase(String nom);
    
    List<Cave> findByOwnerId(Long ownerId);
    
    List<Cave> findByOwnerIdAndNomContainingIgnoreCase(Long ownerId, String nom);
    
}