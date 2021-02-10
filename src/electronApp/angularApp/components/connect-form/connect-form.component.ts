import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { PrinterService } from "../../services/printerService";
import { ErrorLogger } from "../../../core/errorLogger";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { Router, ActivatedRoute } from "@angular/router";
const storage = window.require("electron-json-storage");

/**
 * Error matcher for teh printer address.
 */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  /**
   * Checks if a control is in an error state.
   * @param control The control to check.
   * @param form The form the control is in.
   */
  public isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

/**
 * The connect form component, shown when not connected to a printer.
 */
@Component({
  selector: "app-connect-form",
  templateUrl: "./connect-form.component.html",
  styleUrls: ["./connect-form.component.css"],
})
export class ConnectFormComponent implements OnInit {
  /**
   * Gets a value indicating that the error message should be shown.
   */
  public isError: boolean;

  /**
   * The URL that the user was attempting to navigate to when directed here.
   */
  private returnUrl: string;

  /**
   * Gets the matcher instance for this form.
   */
  public matcher = new MyErrorStateMatcher();

  GetLastIP(): string {
    storage.get("lastIP", function (error, data) {
      if (error) {
        ErrorLogger.NonFatalError(error);
        return "Error";
      } else {
        console.log("GET DATA   " + data.lastIP);
        return data.lastIP;
      }
    });
    return "Nothing from storage or so";
  }

  /**
   * Gets the printer address form.
   */
  PrinterAddress = new FormControl("", [Validators.required]);

  /**
   * Initializes a new instance of the ConnectFormComponent.
   * @param route The current Angular rout.
   * @param printerService The printer service.
   * @param router The Angular router.
   */
  constructor(
    private route: ActivatedRoute,
    private printerService: PrinterService,
    private router: Router
  ) {
    this.printerService.ConnectionStateChanged.Register((isConnected) => {
      // If we now how a connection, continue to our original destination
      if (isConnected) {
        this.router.navigate([this.returnUrl ?? "/"]);
      }
    });
  }

  /**
   * Invoked when the Angular component is initialized.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params.returnUrl as string;
    });
  }

  ngAfterViewInit(): void {
    let temp = "not from storage";
    storage.get("lastIP", function (error, data) {
      if (error) {
        ErrorLogger.NonFatalError(error);
        temp = "Error";
      } else {
        // console.log("GET DATA   " + data.lastIP);
        temp = data.lastIP;
      }
    });
    console.log("temp log: " + temp);
    this.PrinterAddress.setValue(temp);
  }

  /**
   * Invoked when the connect button is pressed
   */
  public async connect(): Promise<unknown> {
    if (this.PrinterAddress.value.trim().length === 0) {
      return;
    }

    try {
      await this.printerService.ConnectAsync(this.PrinterAddress.value);
      storage.set(
        "lastIP",
        { lastIP: this.PrinterAddress.value },
        function (error) {
          if (error) throw error;
        }
      );
    } catch (e) {
      this.isError = true;
      ErrorLogger.NonFatalError(e);
    }
  }
}
