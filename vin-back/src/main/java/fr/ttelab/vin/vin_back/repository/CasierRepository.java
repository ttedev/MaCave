package fr.ttelab.vin.vin_back.repository;

import fr.ttelab.vin.vin_back.model.Casier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CasierRepository extends JpaRepository<Casier, Long> {
    
    List<Casier> findByCaveId(Long caveId);
    
    List<Casier> findByCaveIdOrderByNumeroCasier(Long caveId);
    
}