import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MeusImoveis } from './meus-imoveis';
import { PropertyService } from '../../services/propertyService';
import { UserService } from '../../services/user.service';
import { InterestService } from '../../services/interest.service';
import { Auth } from '../../auth/auth';
import { ToastService } from '../../services/toast.service';
import { InterestStatus } from '../../models/interest-status.enum';
import { InterestSummary } from '../../models/interest-summary';

describe('MeusImoveis', () => {
  let component: MeusImoveis;
  let fixture: ComponentFixture<MeusImoveis>;
  let interestService: jest.Mocked<InterestService>;
  let toastService: jest.Mocked<ToastService>;

  const mockInterests: InterestSummary[] = [
    {
      interestId: 1,
      studentId: 10,
      studentName: 'Maria Silva',
      major: 'Ciência da Computação',
      institution: 'UFAPE',
      status: InterestStatus.PENDING,
      interestDate: '2026-03-05T10:00:00'
    },
    {
      interestId: 2,
      studentId: 11,
      studentName: 'João Santos',
      major: 'Engenharia Civil',
      institution: 'UFPE',
      status: InterestStatus.ACCEPTED,
      interestDate: '2026-03-04T08:30:00'
    }
  ];

  const mockPropertyService = {
    getMyProperties: jest.fn().mockReturnValue(of([])),
    publishProperty: jest.fn().mockReturnValue(of(null)),
    setDraft: jest.fn().mockReturnValue(of(null)),
    deleteProperty: jest.fn().mockReturnValue(of(null))
  };

  const mockUserService = {
    getOwnersReport: jest.fn().mockReturnValue(of([]))
  };

  const mockInterestService = {
    getInterests: jest.fn().mockReturnValue(of([])),
    updateInterestStatus: jest.fn().mockReturnValue(of('Status atualizado')),
    expressInterest: jest.fn().mockReturnValue(of('Interesse registrado'))
  };

  const mockAuth = {
    currentUser$: of(null)
  };

  const mockToastService = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MeusImoveis],
      providers: [
        provideRouter([]),
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: UserService, useValue: mockUserService },
        { provide: InterestService, useValue: mockInterestService },
        { provide: Auth, useValue: mockAuth },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeusImoveis);
    component = fixture.componentInstance;
    interestService = TestBed.inject(InterestService) as jest.Mocked<InterestService>;
    toastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;

    await fixture.whenStable();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  // ── toggleInterests ───

  describe('toggleInterests()', () => {
    it('deve abrir o painel e carregar candidatos na primeira abertura', () => {
      mockInterestService.getInterests.mockReturnValue(of(mockInterests));

      component.toggleInterests(1);

      expect(component.expandedInterestsPropertyId).toBe(1);
      expect(interestService.getInterests).toHaveBeenCalledWith(1);
    });

    it('deve fechar o painel ao clicar no mesmo imóvel que já está aberto', () => {
      mockInterestService.getInterests.mockReturnValue(of(mockInterests));
      component.toggleInterests(1);

      component.toggleInterests(1);

      expect(component.expandedInterestsPropertyId).toBeNull();
    });

    it('não deve chamar getInterests se os dados já estão em cache', () => {
      component.interestsMap.set(5, mockInterests);
      mockInterestService.getInterests.mockReturnValue(of([]));

      component.toggleInterests(5);

      expect(interestService.getInterests).not.toHaveBeenCalled();
      expect(component.expandedInterestsPropertyId).toBe(5);
    });

    it('deve trocar de painel aberto ao clicar em outro imóvel', () => {
      mockInterestService.getInterests.mockReturnValue(of(mockInterests));
      component.interestsMap.set(2, mockInterests);

      component.toggleInterests(1);
      component.toggleInterests(2);

      expect(component.expandedInterestsPropertyId).toBe(2);
    });
  });

  // ── loadInterests ───

  describe('loadInterests()', () => {
    it('deve popular interestsMap com os dados retornados pela API', () => {
      mockInterestService.getInterests.mockReturnValue(of(mockInterests));

      component.loadInterests(3);

      expect(component.interestsMap.get(3)).toEqual(mockInterests);
      expect(component.isLoadingInterests).toBe(false);
    });

    it('deve exibir toast de erro e fechar o painel em caso de falha', () => {
      const erro = new Error('Acesso negado.');
      mockInterestService.getInterests.mockReturnValue(throwError(() => erro));
      component.expandedInterestsPropertyId = 3;

      component.loadInterests(3);

      expect(toastService.error).toHaveBeenCalledWith('Acesso negado.');
      expect(component.expandedInterestsPropertyId).toBeNull();
      expect(component.isLoadingInterests).toBe(false);
    });

    it('deve exibir mensagem genérica se o erro não tiver message', () => {
      mockInterestService.getInterests.mockReturnValue(throwError(() => ({})));

      component.loadInterests(1);

      expect(toastService.error).toHaveBeenCalledWith('Erro ao carregar candidatos.');
    });
  });

  // ── updateCandidateStatus ───

  describe('updateCandidateStatus()', () => {
    beforeEach(() => {
      component.interestsMap.set(1, mockInterests);
      component.expandedInterestsPropertyId = 1;
    });

    it('deve exibir toast de sucesso ao aceitar um candidato', () => {
      mockInterestService.updateInterestStatus.mockReturnValue(of('OK'));
      mockInterestService.getInterests.mockReturnValue(of(mockInterests));

      component.updateCandidateStatus(1, InterestStatus.ACCEPTED, 1);

      expect(toastService.success).toHaveBeenCalledWith('Candidato aceito com sucesso!');
    });

    it('deve exibir toast de sucesso ao recusar um candidato', () => {
      mockInterestService.updateInterestStatus.mockReturnValue(of('OK'));
      mockInterestService.getInterests.mockReturnValue(of(mockInterests));

      component.updateCandidateStatus(1, InterestStatus.REJECTED, 1);

      expect(toastService.success).toHaveBeenCalledWith('Candidato recusado com sucesso!');
    });

    it('deve invalidar o cache e recarregar a lista após atualizar status', () => {
      mockInterestService.updateInterestStatus.mockReturnValue(of('OK'));
      mockInterestService.getInterests.mockReturnValue(of(mockInterests));

      component.updateCandidateStatus(1, InterestStatus.ACCEPTED, 1);

      expect(interestService.getInterests).toHaveBeenCalledWith(1);
      expect(component.interestsMap.has(1)).toBe(true); // recarregou
    });

    it('deve exibir toast de erro ao falhar a atualização', () => {
      const erro = new Error('Apenas o proprietário pode alterar.');
      mockInterestService.updateInterestStatus.mockReturnValue(throwError(() => erro));

      component.updateCandidateStatus(1, InterestStatus.ACCEPTED, 1);

      expect(toastService.error).toHaveBeenCalledWith('Apenas o proprietário pode alterar.');
    });

    it('deve exibir mensagem genérica se o erro não tiver message', () => {
      mockInterestService.updateInterestStatus.mockReturnValue(throwError(() => ({})));

      component.updateCandidateStatus(1, InterestStatus.ACCEPTED, 1);

      expect(toastService.error).toHaveBeenCalledWith(
        'Não foi possível atualizar o status do candidato.'
      );
    });
  });

  // ── getInterestsFor ───

  describe('getInterestsFor()', () => {
    it('deve retornar a lista de interessados quando o cache existe', () => {
      component.interestsMap.set(7, mockInterests);

      const result = component.getInterestsFor(7);

      expect(result).toEqual(mockInterests);
      expect(result.length).toBe(2);
    });

    it('deve retornar array vazio quando não há cache para o imóvel', () => {
      const result = component.getInterestsFor(999);

      expect(result).toEqual([]);
    });
  });

  // ── interestStatusLabel ───

  describe('interestStatusLabel()', () => {
    it('deve retornar "Pendente" para PENDING', () => {
      expect(component.interestStatusLabel(InterestStatus.PENDING)).toBe('Pendente');
    });

    it('deve retornar "Aceito" para ACCEPTED', () => {
      expect(component.interestStatusLabel(InterestStatus.ACCEPTED)).toBe('Aceito');
    });

    it('deve retornar "Recusado" para REJECTED', () => {
      expect(component.interestStatusLabel(InterestStatus.REJECTED)).toBe('Recusado');
    });
  });

  // ── interestStatusClass ───

  describe('interestStatusClass()', () => {
    it('deve retornar "interest-pending" para PENDING', () => {
      expect(component.interestStatusClass(InterestStatus.PENDING)).toBe('interest-pending');
    });

    it('deve retornar "interest-accepted" para ACCEPTED', () => {
      expect(component.interestStatusClass(InterestStatus.ACCEPTED)).toBe('interest-accepted');
    });

    it('deve retornar "interest-rejected" para REJECTED', () => {
      expect(component.interestStatusClass(InterestStatus.REJECTED)).toBe('interest-rejected');
    });
  });
});
