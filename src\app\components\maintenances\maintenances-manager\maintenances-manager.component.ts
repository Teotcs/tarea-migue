import { Component, EventEmitter, inject, Injector, Input, Output, ViewChild, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GeneralUtility } from '../../../shared/general-utility';
import { PrimeModule } from '../../../shared/prime/prime.module';
import { EnvironmentInterface } from '../../../models/work-environment/environment-interface';
import { DialogComponent } from "../components/dialog/dialog.component";
import { ViewDialogComponent } from '../components/view-dialog.component/view-dialog.component';
import { HostListener } from '@angular/core';

// Services
import { EnvironmentService } from '../services/environment.service';
import { ProjectmanagerService } from '../services/projectmanager.service';
import { ServiceManagerService } from '../services/service-manager.service';
import { EvcService } from '../services/evc.service';
import { WonService } from '../services/won.service';
import { GradoService } from '../services/grado.service';
import { SemilleroService } from '../services/semillero.service';

import { lineaConocimientoService } from '../services/linea-conocimiento-service.service';
import { ProfilesService } from '../services/profiles.service';
import { LidertecnicoService } from '../services/lidertecnico.service';
import { userService } from '../../login/service/user/user.service';
import { user } from '../../../models/user';
import { DialogRecoverPassComponent } from "../../login/components/dialog-recover-pass/dialog-recover-pass.component";
import { EmpleadoServiceService } from '../../../models/associates/service/empleado.service';
import { AssociatesInterface } from '../../../models/associates/associates-interface';


@Component({
  selector: 'app-maintenances-manager',
  standalone: true,
  imports: [PrimeModule, DialogComponent, DialogRecoverPassComponent, ViewDialogComponent],
  templateUrl: './maintenances-manager.component.html',
  styleUrl: './maintenances-manager.component.scss'
})
export class MaintenancesManagerComponent implements OnInit, AfterViewInit {
  title: string = '';
  itemId: number = 0;
public empleadoService = inject(EmpleadoServiceService)

   empleados: AssociatesInterface[] = [];
  tableScrollHeigh: string = '400px'

  hasChangePassword: boolean = false;
  viewDialogData: any = {};
  displayViewDialog: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) { }

  calculateTableHeight() {
    // Obtén el alto de la toolbar (ajusta el ID según tu template)
    const toolbar = document.getElementById('toolbard-top');
    const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;

    // Obtén el padding del contenedor (ajusta según tu diseño)
    const cardPadding = 270;

    // Calcula el alto disponible
    const availableHeight = window.innerHeight - toolbarHeight - cardPadding;

    // Asigna el valor a tableScrollHeight (con un mínimo de 100px)
    this.tableScrollHeigh = `${Math.max(availableHeight, 100)}px`;
  }

  // Después de que la vista se inicialice, calcula el alto
  ngAfterViewInit() {
    // Defer the calculation to the next change detection cycle
    setTimeout(() => {
      this.calculateTableHeight();
      this.cdr.detectChanges(); // Forzar detección de cambios después de la actualización
    }, 0);
  }

  // Escucha cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.calculateTableHeight();
  }


 @Input()
set init(item: any) {
  this.itemId = item.itemId;

  // Personalización por sección
  if (item.itemId === 4) {
    this.title = 'Líder EVC';
  } else {
    this.title = item.title;
  }
}
  @ViewChild(DialogComponent) dialogMaintenances!: DialogComponent
  @ViewChild(ViewDialogComponent) viewDialogMaintenances!: ViewDialogComponent
  @Output() back = new EventEmitter<void>();

  private injector = inject(Injector);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  first = 0;
  data: EnvironmentInterface[] = [];
  headers = [
    { header: '', field: '' },
    { header: '', field: '' }
  ]

  private injectedService: any;

  ngOnInit(): void {
    this.injectedService = this.getService(this.itemId);

    this.getAll();
     this.empleadoService.getEmpleados().subscribe((data) => {
      this.empleados = data;
  });
  }

  getEmpleadoCreador(clienteId: number | undefined): string {
  if (!clienteId) return 'Desconocido';
  const empleado = this.empleados.find(emp => emp.id === clienteId);
  return empleado ? `${empleado.numEmpleado}` : 'Desconocido';
}



  getService(id: number) {
    switch (id) {
      case 1:
        console.log('Inyectando servicio environment')

        this.headers = [
          { header: 'Nombre entorno', field: 'nombreEntorno' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' }
        ]
        return this.injector.get(EnvironmentService);

      case 2:
        console.log('Inyectando servicio Evc')

        this.headers = [
          { header: 'Nombre EVC', field: 'nombreEvc' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' },
          { header: 'Service Manager', field: 'serviceManagerNombre' },
          // { header: ' Lider Técnico', field: 'LiderEvc' }
        ]
        return this.injector.get(EvcService);

      case 3:
        console.log('Inyectando servicio Grados')

        this.headers = [
          { header: 'Nombre Grado', field: 'grado' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' }
        ]
        return this.injector.get(GradoService);

      case 4:
        console.log('Inyectando servicio de Lider tecnico')

        this.headers = [
          { header: 'Nombre Lider de EVC', field: 'nombre' },
          { header: 'Correo electrónico', field: 'correo' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' }
        ]
        return this.injector.get(LidertecnicoService);


      case 5:
        console.log('Inyectando servicio profile')

        this.headers = [
          { header: 'Nombre profile', field: 'nombrePerfil' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' },
        ]
        return this.injector.get(ProfilesService);

      case 6:
        console.log('Inyectando servicio project manager')

        this.headers = [
          { header: 'Nombre project manager', field: 'nombrePm' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' }
        ]
        return this.injector.get(ProjectmanagerService);
      case 7:
        console.log('Inyectando servicio de service manager')

        this.headers = [
          { header: 'Nombre service manager', field: 'nombreSm' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' }
        ]
        return this.injector.get(ServiceManagerService);
      case 8:
        console.log('Inyectando servicio de semillero')

        this.headers = [
          { header: 'Nombre semillero', field: 'nombreSemillero' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' }
        ]
        return this.injector.get(SemilleroService);


      case 9:
        console.log("Inyectando servicio de usuarios");

        this.headers = [
          { header: 'Nombre de usuario', field: 'nombreUsuario' },
          { header: 'Usuario que modifica', field: 'usuarioModifica' }
        ]
        return this.injector.get(userService)

      case 10:

        console.log('Inyectando servicio de won')
        this.headers = [
          { header: 'Nombre de won', field: 'numWon' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' }
        ]
        return this.injector.get(WonService);

      case 11:
        console.log('Inyectando servicio de Linea de conocimiento')
        this.headers = [
          { header: 'Nombre de Linea Conocimiento', field: 'nombreLinea' },
          { header: 'Usuario que modifica', field: 'nombreUsuario' }
        ]
        return this.injector.get(lineaConocimientoService);
      default:
        throw new Error('ID de servicio no válido')
    }
  }

  isViewing: boolean = false
  isEditting: boolean = false
  onCreate(): void {
    this.dialogMaintenances.showDialog("create");
    this.isEditting = false
    this.isViewing = false
  }

  onEdit(data: any): void {
    this.isEditting = true
    this.dialogMaintenances.showDialog("edit", data);
  }

  onView(data: any): void {
  this.isEditting = false
  this.isViewing = true
  this.viewDialogMaintenances.showDialog(data);
}

  getAll(): void {
    this.injectedService.getAll().subscribe({
      next: (response: any[]) => {
        console.log('Respuesta getAll:', response);
        this.data = response || [];
      },
      error: (error: any) => {
        console.error('Error en getAll:', error);

        // Manejo seguro del error para evitar 'Cannot read properties of null'
        let errorMessage = 'Error al cargar los datos';

        if (error && error.error) {
          if (error.error.mensaje) {
            errorMessage = error.error.mensaje;
          } else if (error.status === 403) {
            errorMessage = 'No tiene permisos para acceder a estos datos. Verifique que su sesión esté activa y que tenga los permisos necesarios.';
            console.warn('Error 403 Forbidden: Posible problema de autenticación o permisos');
          }
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  create(data: any) {
    console.log(this.data);
    console.log(data);

    console.log("itemId: ", this.itemId)
    let dataForm; // Es para definir el objeto que será enviado en la petición
    let valueFromForm; // Es para setear la información que se captura en el formulario
    let validation; // Almacenara true o false dependiendo la validación de registros que se tienen actualmente en data
    switch (this.itemId) {

      case 1:
        valueFromForm = data.entornoName;
        validation = this.validateRecords('nombreEntorno', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'error', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            ...data,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendPostCreate(dataForm);
        }
        break;
      case 2:
        valueFromForm = data.evcName;
        validation = this.validateRecords('nombreEvc', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'error', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            ...data,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            serviceManagerId: data.serviceManagerId,
            liderTecnicoId: data.liderTecnicoId,
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          console.log('Formulario antes de enviar:', data);
          this.sendPostCreate(dataForm);
        }
        break;

      case 3:
        valueFromForm = data.gradoName;
        validation = this.validateRecords('grado', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            ...data,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendPostCreate(dataForm);
        }
        break;

       case 4:
        valueFromForm = data.liderTecnicoName;
        validation = this.validateRecords('nombre', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          const correoLiderTecnico = data.correo;
          const allowedDomains = this.validatorEmail('correoLiderTecnico', correoLiderTecnico);
          if (allowedDomains) {
            this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'El correo debe ser corporativo: tcs.com o bancolombia.com.co' });
            return;
          } else {
            dataForm = {
              ...data,
              estado: true,
              usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
              clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
            };
            if ('id' in dataForm) {
              delete dataForm.id;
            }
          }
          this.sendPostCreate(dataForm);
        }

        break;

      case 5:
        valueFromForm = data.perfilName;
        validation = this.validateRecords('nombrePerfil', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          const tarifaPerfil = data.tarifaPerfil;
          const validationTarifa = this.validateRecords('tarifaPerfil', valueFromForm);
          if (validationTarifa) {
            this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'La tarifa de perfil no es válida' });
            return;
          } else {
            dataForm = {
              ...data,
              tarifaPerfil: tarifaPerfil,
              estado: true,
              usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
              clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
            };
          }
          this.sendPostCreate(dataForm);
        }
        break;

      case 6:
        valueFromForm = data.pmName;
        validation = this.validateRecords('nombrePm', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'error', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            ...data,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendPostCreate(dataForm);
        }
        break;
      case 7:
        valueFromForm = data.nombreSm;
        validation = this.validateRecords('nombreSm', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'error', summary: '¡No se ha podido crear el registro!', detail: 'El nombre de Service Manager no puede estar vacío o ya existe.' });
          return;
        } else {
          dataForm = {
            nombreSm: valueFromForm,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendPostCreate(dataForm);
        }
        break;
      case 8:
        valueFromForm = data.semilleroName;
        validation = this.validateRecords('nombreSemillero', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            ...data,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendPostCreate(dataForm);
        }

        break;


      case 9:
        // Validamos el nombre de usuario
        valueFromForm = data.usernum;
        validation = this.validateRecords('nombreUsuario', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ya existe un usuario con ese nombre' });
          return;
        }

        console.log('MaintenancesManager - data.password:', data.password, 'data.password2:', data.password2);

        // Validamos que las contraseñas coincidan
        if (data.password?.trim() !== data.password2?.trim()) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden' });
          return;
        }

        // Validamos que el rol sea válido
        if (!data.roll) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar un rol' });
          return;
        }

        // Si todas las validaciones pasan, construimos el objeto dataForm
        dataForm = {
          numUsuario: data.usernum,
          contrasena: data.password,
          contrasena2: data.password2,
          rol: data.roll,
          nombreUsuario: data.username,
          clienteId: data.clienteId
        };

        console.log('Datos a enviar usuario:', dataForm);
        this.sendPostCreate(dataForm);
        break;

      case 10:
        valueFromForm = data.wonName;
        validation = this.validateRecords('wonName', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            ...data,  // todos los valores que vienen del formulario
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendPostCreate(dataForm);
        }
        break;

      case 11:
        valueFromForm = data.lineaConocimientoName;
        validation = this.validateRecords('nombreLinea', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            ...data,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendPostCreate(dataForm);
        }
        break;

    }
  }

  editRecord(data: any) {
    const usuarioId = sessionStorage.getItem('usuarioId');
    console.log('edicion', data);
    let dataForm; // Objeto que será enviado en la petición
    let valueFromForm;
    let validation;
    switch (this.itemId) {

      case 1:
        valueFromForm = data.dialogForm.entornoName;
        validation = this.validateRecords('nombreEntorno', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            ...data,
            nombreEntorno: valueFromForm,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendItemToEdit(dataForm, data.id);
        }
        break;
//lo que sirve
      case 2:
  console.log('dialogForm antes de armar objeto:', data.dialogForm);

  valueFromForm = data.dialogForm.evcName;
  validation = this.validateRecords('nombreEvc', valueFromForm, data.id); // ✅ evitar comparar con sí mismo

  if (validation) {
    this.messageService.add({
      severity: 'error',
      summary: '¡No se ha podido crear el registro!',
      detail: 'Al parecer ya existe un registro con ese nombre'
    });
    return;
  } else {
    const dataForm = {
      nombreEvc: valueFromForm,
      serviceManagerId: data.dialogForm.serviceManagerId,
      liderTecnicoId: data.dialogForm.liderTecnicoId,
      estado: true,
      usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
      clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
    };

    console.log('Objeto FINAL a enviar:', dataForm);
this.sendItemToEdit(dataForm, data.id);
  }
  break;

  case 3:
        valueFromForm = data.dialogForm.gradoName;
        validation = this.validateRecords('grado', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            grado: valueFromForm,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendItemToEdit(dataForm, data.id);
        }
        break;

      case 4:

        valueFromForm = data.dialogForm.liderTecnicoName;
        validation = this.validateRecords('nombre', valueFromForm, data.id);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          const correoLiderTecnico = data.dialogForm.correoLiderTecnico;
          const validationEmail = this.validateRecords('correo', valueFromForm);
          if (validationEmail) {
            this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'El correo no es válido' });
          }
          else {
            dataForm = {
              nombre: valueFromForm,
              correo: correoLiderTecnico,
              estado: true,
              usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
              clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
            };
          }
          this.sendItemToEdit(dataForm, data.id);
        }

        break;

         case 5:
        valueFromForm = data.dialogForm.perfilName;
        validation = this.validateRecords('nombre', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          const tarifaPerfil = data.dialogForm.tarifaPerfil;
          const validationEmail = this.validateRecords('tarifa', valueFromForm);
          if (validationEmail) {
            this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'El correo no es válido' });
            return;
          } else {
            dataForm = {
              nombrePerfil: valueFromForm,
              tarifaPerfil: tarifaPerfil,
              estado: true,
              usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
              clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
            };
          }
          this.sendItemToEdit(dataForm, data.id);

        }
        break;

      case 6:
        valueFromForm = data.dialogForm.pmName;
        validation = this.validateRecords('nombrePm', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            nombrePm: valueFromForm,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendItemToEdit(dataForm, data.id);
        }
        break;


      case 7:
        valueFromForm = data.dialogForm.serviceManagerName;
        if (!valueFromForm || valueFromForm.trim() === '') {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El nombre del Service Manager no puede estar vacío.' });
          return;
        }
        validation = this.validateRecords('nombreSm', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            nombreSm: valueFromForm,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendItemToEdit(dataForm, data.id);
        }
        break;

      case 8:
        valueFromForm = data.dialogForm.semilleroName;
        validation = this.validateRecords('nombreSemillero', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            nombreSemillero: valueFromForm,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendItemToEdit(dataForm, data.id);
        }
        break;

      case 9:
        const dialogForm = data.dialogForm;

        // Validamos 'numUsuario'
        valueFromForm = dialogForm.usernum;
        validation = this.validateRecords('numEmpleado', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        }

        // Validamos 'contraseña'
        const contrasena = dialogForm.password;
        const contrasena2 = dialogForm.password2;
        if (contrasena !== contrasena2) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Las contraseñas no coinciden' });
          return;
        }

        // Validamos 'rol'
        const roll = dialogForm.roll;
        validation = this.validateRecords('rol', roll);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'El rol no es válido' });
          return;
        }

        // Si todas las validaciones pasan, construimos el objeto dataForm
        dataForm = {
          id: data.id,
          numUsuario: dialogForm.usernum,
          contrasena: dialogForm.password,
          rol: dialogForm.roll,
          nombreUsuario: dialogForm.username,
          estado: true,
          usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
          clienteId: parseInt(dialogForm.clienteId, 10)
        };

        console.log('Datos a editar usuario:', dataForm);
        this.sendItemToEdit(dataForm, data.id);

        break;

      case 10:
        valueFromForm = data.dialogForm.wonName;
        validation = this.validateRecords('wonName', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            id: data.id,
            wonName: valueFromForm,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendItemToEdit(dataForm, data.id);
        }
        break;

      case 11:
        valueFromForm = data.dialogForm.lineaConocimientoName;
        validation = this.validateRecords('nombreLinea', valueFromForm);
        if (validation) {
          this.messageService.add({ severity: 'info', summary: '¡No se ha podido crear el registro!', detail: 'Al parecer ya existe un registro con ese nombre' });
          return;
        } else {
          dataForm = {
            id: data.id,
            nombreLinea: valueFromForm,
            estado: true,
            usarioModifica: parseInt(sessionStorage.getItem('id')!, 10),
            clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10)
          };
          this.sendItemToEdit(dataForm, data.id);
        }
        break;


    }
  }

viewRecord(data: any) {
  const usuarioId = sessionStorage.getItem('id');
  console.log('viendo registro:', data);

  // Extraemos el formulario desde el dialog
  const dialogForm = data.dialogForm;

  // Construimos el objeto con la información a mostrar
  const viewDataForm = {
id: data.id,
    numEmpleado: dialogForm?.usernum,
    contrasena: dialogForm?.password,
    rol: dialogForm?.roll,
    nombreUsuario: dialogForm?.username,
    estado: data.estado ?? true,
    usuarioCreador: usuarioId,
    clienteId: parseInt(sessionStorage.getItem('clienteId')!, 10),
  };

  // Aquí puedes abrir un modal o asignar a una variable para mostrarlo en pantalla
  console.log('Datos para visualizar:', viewDataForm);

  // Por ejemplo, si tienes un modal puedes hacer:
  this.viewDialogData = viewDataForm;
  this.displayViewDialog = true;
}

//Validadores diferentes CASE
  validateRecords(entorno: string, dataFromForm: any, idToExclude?: number): boolean {

    if (this.validatorEmail(entorno,dataFromForm)) return true;
  // Caso especial para EVC (itemId === 2)
  if (this.itemId === 2 && entorno === 'nombreEvc') {
    const lowerCaseForm = (dataFromForm ?? '').toString().toLowerCase();

    return this.data.some((item: any) =>
      (item.nombreEvc ?? '').toString().toLowerCase() === lowerCaseForm &&
      item.serviceManagerId === this.dialogMaintenances.dialogForm.get('serviceManagerId')?.value &&
      item.id !== idToExclude // Ignora el registro actual en edición
    );
  }
  // Validación general para strings
  if (typeof dataFromForm === 'string') {
    const lowerCaseForm = (dataFromForm ?? '').toString().toLowerCase();

    return this.data.some((item: any) =>
      (item[entorno] ?? '').toString().toLowerCase() === lowerCaseForm &&
      item.id !== idToExclude //  Ignora el registro actual
    );
  } else {
    // Validación general para números o no strings
    return this.data.some((item: any) =>
      item[entorno] === dataFromForm &&
      item.id !== idToExclude //  Ignora el registro actual
    );
  }
}

validatorEmail(entorno: string, dataFromForm: any): boolean {
  // ✅ Solo validar si el campo es el correo del líder técnico
  if (entorno !== 'correoLiderTecnico') return false;

  if (typeof dataFromForm === 'string') {
const allowedDomains = ['tcs.com', 'bancolombia.com.co'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(dataFromForm)) return true; // ❌ Formato de correo inválido

    const domain = dataFromForm.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(domain)) return true; // ❌ Dominio no permitido
  }

  return false; // ✅ Todo bien
}

  sendPostCreate(data: any) {
    console.log('Sending data to backend:', data);
    this.injectedService.create(data).subscribe({
      next: (response: any) => {
        console.log('Respuesta del backend:', response);
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: response.mensaje || 'Registro creado exitosamente' });
        // Intentamos obtener el objeto creado desde la respuesta del backend.

// Dependiendo del backend puede venir en response.data, response.item, response.usuario, response.entity, etc.

// Probamos varias propiedades y usamos la que exista.

const maybeCreated =

  response?.data ||

  response?.item ||

  response?.usuario ||

  response?.entity ||

  response?.result ||

  response?.registro ||

  response;

// Si parece un objeto con id (o con nombre de usuario) lo agregamos al inicio.

// Si no, volvemos a recargar con getAll() como respaldo.

if (maybeCreated && typeof maybeCreated === 'object' && (maybeCreated.id || maybeCreated.nombreUsuario || maybeCreated.numUsuario)) {

  // Evitar duplicados: si ya existe un elemento con ese id, no lo duplicamos

  if (!this.data.some((d: any) => d.id && maybeCreated.id && d.id === maybeCreated.id)) {

    this.data = [maybeCreated, ...this.data];

  } else {

    // Si ya existe (por ejemplo la lista ya venía con ese item), simplemente no hacemos nada.

  }

} else {

  // Fallback: si la respuesta no contiene el objeto creado, recargamos la lista

  this.getAll();

}
 
      },
      error: (error: any) => {
        console.error('Error del backend:', error);
        let errorMessage = 'Hubo un problema al crear el registro.';

        if (error.error && error.error.mensaje) {
          errorMessage = error.error.mensaje;
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor. Por favor, intente nuevamente.';
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos. Por favor, verifique la información ingresada.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  users: user[] = []

  sendItemToEdit(data: any, id: number) {
    console.log('Data items enviados al servicio:', data, id);

    if (this.itemId === 9) { // Verifica si es el caso de usuarios
      this.injectedService.updateUser(id, data).subscribe({
        next: (response: any) => {
          console.log(id)
          console.log(response)
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: response.mensaje });
          this.getAll();
        },
        error: (error: any) => {
          console.log(error);
        }
      });
    } else { // Para los demás casos, llama a update
      this.injectedService.update(id, data).subscribe({
        next: (response: any) => {
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: response.mensaje });
          this.getAll();
        },
        error: (error: any) => {
          console.log(error);
        }
      });
    }
  }

  delete(id: number) {
    this.injectedService.delete(id).subscribe({
      next: (response: any) => {
        this.data = this.data.filter(item => item.id !== id);
        this.messageService.add(GeneralUtility.successMaintenancesMessage());
      },
      error: (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "No se puede eliminar este mantenimiento porque está vinculado a uno o más asociados.", life: 90000 });
      }
    })
  }

  @ViewChild(DialogRecoverPassComponent) dialogRecoverPass!: DialogRecoverPassComponent;

  reinstateUser(id: number) {
    this.injectedService.reinstateUser(id).subscribe({
      next: (response: any) => {
        this.data = this.data.filter(item => item.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: "Usuario desbloqueado con éxito, realice cambio de contraseña" });

        this.getAll();
        this.dialogRecoverPass.init();
      },
      error: (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "No se puede desbloquear el usuario.", life: 90000 });
      }
    })
  }

  blockUser(id: number) {
    this.injectedService.blockUser(id).subscribe({
      next: (response: any) => {
        this.data = this.data.filter(item => item.id !== id);
        this.messageService.add(GeneralUtility.successBlockUserMessage());
        this.getAll();
      },
      error: (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "No se puede bloquear el usuario.", life: 90000 });
      }
    })
  }

  confirmBlock(event: Event, rowData: any) {
    const id = rowData.id;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Deseas bloquear este usuario?',
      icon: 'pi pi-info-circle p-3 pr-1',
      acceptLabel: 'Bloquear',
      acceptButtonStyleClass: 'p-button-danger p-button-sm ',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",

      accept: () => {
        this.blockUser(id);
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Has rechazado la acción', life: 3000 });
      }
    });
  }


  confirmDelete(event: Event, rowData: any) {
    const id = rowData.id;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Deseas eliminar este registro?',
      icon: 'pi pi-info-circle p-3 pr-1',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm ',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",

      accept: () => {
        this.delete(id);
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Has rechazado la acción', life: 3000 });
      }
    });

  }

  getFields() {
    return this.headers.map(header => header.field)
  }

  onBack(): void {
    this.back.emit();
  }

}
