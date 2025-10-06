import { Component, EventEmitter, inject, Input, OnInit, Output, } from '@angular/core';
import { PrimeModule } from '../../../../shared/prime/prime.module';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, } from '@angular/forms';
import { ParentsInterface } from '../../../../models/associates/parents-interface';
import { RolService } from '../../../login/service/rol/rol.service';
import { Rol } from '../../../../models/rol';
import { ServiceManagerService } from '../../services/service-manager.service';
import { LidertecnicoService } from '../../services/lidertecnico.service';
import { ServiceManager } from '../../components/table/interfaces/service-manager.interface';
import { ClienteService, Cliente } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [PrimeModule, ReactiveFormsModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent implements OnInit {
  @Input() headerDialog: string = '';
  @Input() groupIdentification: number = 0;
  @Output() onSave = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  visible: boolean = false;
  type: string = 'create';
  idItemEdit!: number;

  private rolService = inject(RolService);
  private serviceManagerService = inject(ServiceManagerService);
  private liderTecnicoService = inject(LidertecnicoService);
  private clienteService = inject(ClienteService);

  parents!: ParentsInterface[];
  roles!: Rol[];
  serviceManagers: any[] = [];
  lideresTecnicos: any[] = [];
  clientes: Cliente[] = [];
  dialogVisible: any;


  public listaRoles(): void {
    this.rolService.listRoles().subscribe({
      next: (items: Rol[]) => {
        console.log(items);
        if (items.length > 0) {
          this.roles = items;
        }
      },
      error: (error: any) => console.error(error),
    });
  }

  dialogForm = new FormGroup({
    entornoName: new FormControl(''),
    evcName: new FormControl(''),
    gradoName: new FormControl(''),
    liderTecnicoName: new FormControl(''),
    correoLiderTecnico: new FormControl(''),
    perfilName: new FormControl(''),
    //tarifaPerfil: new FormControl(''),
    pmName: new FormControl(''),
    serviceManagerName: new FormControl(''),
    semilleroName: new FormControl(''),
    wonName: new FormControl(''),
    lineaConocimientoName: new FormControl(''),
    serviceManagerId: new FormControl(null),
    liderTecnicoId: new FormControl(null),

    //crear usuario
    usernum: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6,7}$/)
    ]),
    username: new FormControl(''),
    password: new FormControl(''),
    password2: new FormControl(''),
    roll: new FormControl<Rol | null>(null),
    clienteId: new FormControl(null),
  });

  constructor() { }

  ngOnInit(): void {
    this.setValidators(this.groupIdentification);
    this.listaRoles();
    this.loadServiceManagers();
    this.loadLideresTecnicos();
    this.cargarClientes();
  }

  loadServiceManagers() {
    this.serviceManagerService.getAll().subscribe({
      next: (response: ServiceManager[]) => {
        console.log('Service Managers raw response:', response);
        if (!Array.isArray(response)) {
          console.error('La respuesta no es un array:', response);
          return;
        }
        this.serviceManagers = response.map((manager) => ({
          id: manager.id,
          nombreSm: manager.nombreSm || 'Sin nombre',
        }));
        console.log('Service Managers procesados:', this.serviceManagers);
      },
      error: (error) => {
        console.error('Error loading service managers:', error);
        this.serviceManagers = [];

        // Manejo mejorado de errores
        if (error && error.status === 403) {
          console.warn('Error 403 Forbidden: Posible problema de autenticación o permisos en dialog component');
        }
      },
    });
  }

  loadLideresTecnicos() {
    this.liderTecnicoService.getAll().subscribe({
      next: (response: any[]) => {
        this.lideresTecnicos = response.map((lider) => ({
          id: lider.id,
          nombre: lider.nombre,
        }));
      },
      error: (error) => console.error('Error loading lideres tecnicos:', error),
    });
  }

  cargarClientes() {
    this.clienteService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
        console.log('Clientes cargados:', this.clientes);
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
      },
    });
  }

  setValidators(id: number) {
    // Campos que deben ser limpiados de validadores previos
    const uppercaseFields = [
      'username',
      'usernum',
      'password',
      'password2',
      'roll',
      'employee',
      'clienteId',
      'entornoName',
      'evcName',
      'gradoName',
      'liderTecnicoName',
      'correoLiderTecnico',
      'perfilName',
      'tarifaPerfil',
      'pmName',
      'serviceManagerName',
      'semilleroName',
      'wonName',
      'lineaConocimientoName'
    ];

    // Limpiar validadores anteriores
    uppercaseFields.forEach(field => this.dialogForm.get(field)?.clearValidators());

    switch (id) {
      case 1:
        this.applyRequired('entornoName');
        break;

      case 2:
        this.applyRequired('evcName');
        this.dialogForm.get('serviceManagerId')?.setValidators([Validators.required]);
        this.dialogForm.get('liderTecnicoId')?.setValidators([Validators.required]);
        break;

      case 3:
        this.applyRequired('gradoName');
        break;

      case 4: // NO convertir a mayúsculas en la sección de Líder Técnico
        this.dialogForm.get('liderTecnicoName')?.setValidators([Validators.required]);
        this.dialogForm.get('correoLiderTecnico')?.setValidators([Validators.required]);
        break;

      case 5:
        this.applyRequired('perfilName');
        this.applyRequired('tarifaPerfil');
        break;

      case 6:
        this.applyRequired('pmName');
        break;

      case 7: // NO convertir a mayúsculas en la sección de Service Manager
        const serviceManagerControl = this.dialogForm.get('serviceManagerName');
        if (serviceManagerControl) {
          serviceManagerControl.setValidators([Validators.required]);
        }
        break;

      case 8:
        this.applyRequired('semilleroName');
        break;

      case 9: // NO convertir a mayúsculas en la sección de Usuario
        this.dialogForm.get('username')?.setValidators([
          Validators.required,
        ]);
        this.dialogForm.get('password')?.setValidators([
          Validators.required,
          Validators.minLength(6)
        ]);
        this.dialogForm.get('password2')?.setValidators([
          Validators.required,
          Validators.minLength(6),
          this.passwordMatchValidator.bind(this)
        ]);
        this.dialogForm.get('roll')?.setValidators([Validators.required]);
        this.dialogForm.get('usernum')?.setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(7),
          Validators.pattern('^[a-zA-Z0-9 ]*$')
        ]);
        this.dialogForm.get('clienteId')?.setValidators([Validators.required]);
        break;

      case 10:
        this.applyRequired('wonName');
        break;

      case 11:
        this.applyRequired('lineaConocimientoName');
        break;
    }
  }

  // Función auxiliar que aplica "required" y transforma a mayúsculas, excepto cuando se indica lo contrario
  private applyRequired(fieldName: string, excludeUppercase: boolean = false) {
    const control = this.dialogForm.get(fieldName);
    if (control) {
      control.setValidators([Validators.required]);
      if (!excludeUppercase) {
        control.valueChanges.subscribe(value => {
          const upperValue = value?.toUpperCase() || '';
          if (value !== upperValue) {
            control.setValue(upperValue, { emitEvent: false });
          }
        });
      }
    }
  }
  soloLetras(event: KeyboardEvent): void {
    const tecla = event.key;
    const letrasPermitidas = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
    if (!letrasPermitidas.test(tecla)) {
      event.preventDefault();
    }
  }
  soloNumeros(event: KeyboardEvent): void {
    const tecla = event.key;
    if (!/^[0-9]$/.test(tecla)) {
      event.preventDefault();
    }
  }





  setFormEdit(data: any) {
    console.log('edicion', data);
    switch (this.groupIdentification) {
      case 1:
        this.dialogForm.patchValue({ entornoName: data.nombreEntorno });
        this.idItemEdit = data.id;
        break;

      case 2:
        setTimeout(() => {
          const smId = this.serviceManagers.find(
            sm => sm.nombreSm?.trim().toLowerCase() === (data.nombreServiceManager || '').trim().toLowerCase()
          )?.id || null;
          const ltId = this.lideresTecnicos.find(
            lt => lt.nombre?.trim().toLowerCase() === (data.nombreLiderTecnico || '').trim().toLowerCase()
          )?.id || null;
          console.log('smId encontrado:', smId);
          console.log('ltId encontrado:', ltId);
          this.dialogForm.patchValue({
            evcName: data.nombreEvc?.toUpperCase(),
            serviceManagerId: data.serviceManagerId || smId,
            liderTecnicoId: data.liderTecnicoId || ltId,
          });
          this.idItemEdit = data.id;
        }, 200);
        break;

      case 3:
        this.dialogForm.patchValue({ gradoName: data.grado });
        this.idItemEdit = data.id;
        break;
      case 4: //llamar el dato en editar

        this.dialogForm.patchValue({
          liderTecnicoName: data.nombre,
          correoLiderTecnico: data.correo,
        });
        this.idItemEdit = data.id;
        break;


      case 5:
        this.dialogForm.patchValue({
          perfilName: data.nombrePerfil,
          //tarifaPerfil: data.tarifa,
        });
        this.idItemEdit = data.id;
        break;
      case 6:
        this.dialogForm.patchValue({ pmName: data.nombrePm });
        this.idItemEdit = data.id;
        break;
      case 7:
        this.dialogForm.patchValue({ serviceManagerName: data.nombreSm });
        this.idItemEdit = data.id;
        break;

      case 8:
        this.dialogForm.patchValue({ semilleroName: data.nombreSemillero });

        console.log('case 8', data);
        this.idItemEdit = data.id;
        break;

      case 9:
        console.log('case 9 - datos recibidos:', data);


        let rolSeleccionado = null;

        if (data.rol) {

          if (typeof data.rol === 'object' && data.rol.id) {
            rolSeleccionado = this.roles.find(rol => rol.id === data.rol.id);
          }

          else if (typeof data.rol === 'number') {
            rolSeleccionado = this.roles.find(rol => rol.id === data.rol);
          }

          else if (typeof data.rol === 'string') {
            rolSeleccionado = this.roles.find(rol =>
              rol.nombre?.toLowerCase() === data.rol.toLowerCase()
            );
          }
        }

        console.log('Rol encontrado para seleccionar:', rolSeleccionado);

        this.dialogForm.patchValue({
          usernum: data.numUsuario,
          username: data.nombreUsuario,
          password: data.contrasena,
          password2: data.contrasena,
          roll: rolSeleccionado, // Usar el objeto completo del rol
          clienteId: data.clienteId,
        });

        this.idItemEdit = data.id;
        break;

      case 10:
        this.dialogForm.patchValue({ wonName: data.numWon });
        this.idItemEdit = data.id;
        break;

      case 11:
        this.dialogForm.patchValue({ lineaConocimientoName: data.nombreLinea });
        this.idItemEdit = data.id;
        break;
    }
  }

  showDialog(type: string, data?: any) {
    this.type = type;
    this.visible = true;
    this.dialogForm.reset();
    this.setValidators(this.groupIdentification);
    if (type === 'edit' && 'view' && data) {
      this.setFormEdit(data);
    }
    // this.headerDialog = this.type ===
    // 'edit' ? 'Editar' : 'Crear';
  }

  passwordMatchValidator(
    control: FormControl
  ): { [key: string]: boolean } | null {
    const password = control.root.get('password');
    const confirmPassword = control;

    console.log('password validator - password:', password?.value, 'confirmPassword:', confirmPassword.value);

    if (password && confirmPassword && password.value?.trim() !== confirmPassword.value?.trim()) {
      return { passwordMissMatch: true };
    }
    return null;
  }

  submitForm() {
    console.log('Formulario completo antes de construir dataToSend:', this.dialogForm.value);

    const usuarioId = sessionStorage.getItem('id');
    if (!usuarioId) {
      console.error('No se encontró el ID del usuario en sessionStorage');
      return;
    }

    if (this.dialogForm.valid) {
      const formData = this.dialogForm.value;
      let dataToSend: any = {};

      switch (this.groupIdentification) {
        case 1: // Entorno
          dataToSend = {
            nombreEntorno: formData.entornoName?.toUpperCase() || '',
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 2: // EVC
          dataToSend = {
            nombreEvc: formData.evcName?.toUpperCase() || '',
            serviceManagerId: formData.serviceManagerId,
            liderTecnicoId: formData.liderTecnicoId,
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 3: // Grado
          dataToSend = {
            grado: formData.gradoName?.toUpperCase() || '',
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 4: // Líder Técnico
          dataToSend = {
            nombre: formData.liderTecnicoName,
            correo: formData.correoLiderTecnico,
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 5: // Perfil
          dataToSend = {
            nombrePerfil: formData.perfilName?.toUpperCase() || '',
            //tarifaPerfil: formData.tarifaPerfil,
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 6: // Project Manager
          dataToSend = {
            nombrePm: formData.pmName?.toUpperCase() || '',
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 7: // Service Manager
          dataToSend = {
            nombreSm: formData.serviceManagerName,
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 8: // Semillero
          dataToSend = {
            nombreSemillero: formData.semilleroName?.toUpperCase() || '',
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 9: // Usuario
          dataToSend = {
            usernum: formData.usernum,
            password: formData.password,
            password2: formData.password2,
            roll: formData.roll,
            username: formData.username,
            clienteId: formData.clienteId ? formData.clienteId : null
          };
          break;
        case 10: // WON
          dataToSend = {
            wonName: formData.wonName?.toUpperCase() || '',
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
        case 11: // Línea de conocimiento
          dataToSend = {
            nombreLinea: formData.lineaConocimientoName?.toUpperCase() || '',
            usarioModifica: parseInt(usuarioId, 10),
            estado: true
          };
          break;
      }


      if (this.type === 'create') {
        this.onSave.emit(dataToSend);
      } else {
        this.onEdit.emit({ id: this.idItemEdit, dialogForm: this.dialogForm.value });
      }
      this.visible = false;
    }
  }
  onInputNumberOnly(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 7); // solo dígitos, máx 10

  }
}

