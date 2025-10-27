package fr.ttelab.vin.vin_back.dto;

import fr.ttelab.vin.vin_back.model.*;
import java.util.stream.Collectors;
import java.util.List;

public class DtoMapper {
    public static UserDto toUserDto(User u) {
        if(u==null) return null; return new UserDto(u.getId(), u.getUsername(), u.getEmail(), u.getFirstName(), u.getLastName());
    }
    public static CaveDto toCaveDto(Cave c) {
        if(c==null) return null;


        return new CaveDto(c.getId(), c.getNom(), c.getDescription(), c.getNombreLignesParCasier(), c.getCapacitesParLigne(), c.getOwner()!=null? c.getOwner().getId():null);
    }
    public static CasierDto toCasierDto(Casier c) {
        if(c==null) return null; return new CasierDto(c.getId(), c.getNumeroCasier(), c.getCave()!=null? c.getCave().getId():null, c.getPosition());
    }
    public static LigneDto toLigneDto(Ligne l) {
        if(l==null) return null; return new LigneDto(l.getId(), l.getNombreBouteillesMax(), l.getCasier()!=null? l.getCasier().getId():null,l.getPosition());
    }
    public static WineDto toWineDto(Wine w) {
        if(w==null) return null; return new WineDto(w.getId(), w.getChateau(), w.getAppellation(), w.getTaille(),w.getAnnee(), w.getCouleur(), w.getPrix(), w.getLigne()!=null? w.getLigne().getId():null,w.getPosition());
    }

    // Mapping profond
    public static CaveDto toCaveDtoDeep(Cave cave) {
        CaveDto dto = toCaveDto(cave);
        if(cave!=null && cave.getCasiers()!=null) {
            dto.setCasiers(cave.getCasiers().stream().map(DtoMapper::toCasierDtoDeep).collect(Collectors.toList()));
        }
        return dto;
    }

    public static CasierDto toCasierDtoDeep(Casier casier) {
        CasierDto dto = toCasierDto(casier);
        if(casier!=null && casier.getLignes()!=null) {
            List<LigneDto> lignes = casier.getLignes().stream().map(DtoMapper::toLigneDtoDeep).collect(Collectors.toList());
            dto.setLignes(lignes);
        }
        return dto;
    }

    public static LigneDto toLigneDtoDeep(Ligne ligne) {
        LigneDto dto = toLigneDto(ligne);
        if(ligne!=null && ligne.getBouteilles()!=null) {
            dto.setBouteilles(ligne.getBouteilles().stream().map(DtoMapper::toWineDto).collect(Collectors.toList()));
        }
        return dto;
    }
}
