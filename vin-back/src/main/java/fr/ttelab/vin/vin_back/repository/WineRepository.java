package fr.ttelab.vin.vin_back.repository;

import fr.ttelab.vin.vin_back.model.Wine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WineRepository extends JpaRepository<Wine, Long> {
    
    List<Wine> findByLigneId(Long ligneId);
    
    List<Wine> findByChateauContainingIgnoreCase(String chateau);
    
    List<Wine> findByAppellationContainingIgnoreCase(String appellation);
    
    List<Wine> findByAnnee(Integer annee);
    
    List<Wine> findByCouleur(Wine.Couleur couleur);
    
    @Query("SELECT w FROM Wine w WHERE w.ligne.casier.cave.id = :caveId")
    List<Wine> findByCaveId(@Param("caveId") Long caveId);
    
}