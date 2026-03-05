package br.edu.ufape.roomie.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoommateRecommendationDTO {
    private Long studentId;
    private String name;
    private String major;
    private Integer compatibilityPercentage;
    private List<String> commonInterests;
}