package br.edu.ufape.roomie.service;

import br.edu.ufape.roomie.dto.AddressDTO;
import br.edu.ufape.roomie.dto.PropertyRequestDTO;
import br.edu.ufape.roomie.enums.PropertyStatus;
import br.edu.ufape.roomie.model.Address;
import br.edu.ufape.roomie.model.Property;
import br.edu.ufape.roomie.model.User;
import br.edu.ufape.roomie.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    public Property saveProperty(PropertyRequestDTO requestDTO) {
        User owner = getAuthenticatedUser();

        Property property = new Property();
        property.setTitle(requestDTO.getTitle());
        property.setDescription(requestDTO.getDescription());
        property.setType(requestDTO.getType());
        property.setPrice(requestDTO.getPrice());
        property.setGender(requestDTO.getGender());
        property.setAcceptAnimals(requestDTO.getAcceptAnimals());
        property.setAvailableVacancies(requestDTO.getAvailableVacancies());
        property.setStatus(PropertyStatus.DRAFT);
        property.setOwner(owner);

        Property savedProperty = propertyRepository.save(property);

        AddressDTO addressDTO = requestDTO.getAddress();
        Address address = new Address();
        address.setStreet(addressDTO.getStreet());
        address.setDistrict(addressDTO.getDistrict());
        address.setNumber(addressDTO.getNumber());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setCep(addressDTO.getCep());
        address.setProperty(savedProperty);

        savedProperty.setAddress(address);

        return propertyRepository.save(savedProperty);
    }

    public Property publishProperty(Long propertyId) {
        User user = getAuthenticatedUser();

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imóvel não encontrado."));

        if (!property.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para publicar este imóvel.");
        }

        property.setStatus(PropertyStatus.ACTIVE);
        return propertyRepository.save(property);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        return (User) principal;
    }
}
