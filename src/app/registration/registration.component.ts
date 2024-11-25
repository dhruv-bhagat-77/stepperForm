import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, signal, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, AbstractControl, ValidatorFn, ValidationErrors, PatternValidator } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
  
  <mat-stepper  #stepper>
    <mat-step [stepControl]="firstFormGroup" #stepper>
      <form [formGroup]="firstFormGroup">
        <ng-template matStepLabel>Personal Information</ng-template>
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" required>
          <mat-error *ngIf="firstFormGroup.get('email')?.errors">
            <span *ngIf="firstFormGroup.get('email')?.hasError('required')">Email is required.</span>
            <span *ngIf="firstFormGroup.get('email')?.hasError('pattern')">Invalid email format. Please enter a valid email address.</span>
          </mat-error>
        </mat-form-field>
              <div class="col-12 col-md-6">
                <mat-form-field appearance="outline" style="width: 100%;">
                  <mat-label>First name</mat-label>
                  <input matInput formControlName="firstName" required>
                  <mat-error *ngIf="firstFormGroup.get('firstName')?.errors">
                    <span *ngIf="firstFormGroup.get('firstName')?.hasError('required')">First Name is required.</span>
                    <span *ngIf="firstFormGroup.get('firstName')?.hasError('pattern')">Only alphabetic characters (both uppercase and lowercase) and space are allowed.</span>
                  </mat-error>
                </mat-form-field>
              </div>
              <div class="col-12 col-md-6">
                <mat-form-field appearance="outline" style="width: 100%;">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" required>
                  <mat-error *ngIf="firstFormGroup.get('lastName')?.errors">
                    <span *ngIf="firstFormGroup.get('lastName')?.hasError('required')">Last Name is required.</span>
                    <span *ngIf="firstFormGroup.get('lastName')?.hasError('pattern')">Only alphabetic characters (both uppercase and lowercase) and space are allowed.</span>
                  </mat-error>
                </mat-form-field>
              </div>
              <div class="col-12 col-md-4">
                <mat-form-field appearance="outline">
                  <mat-label>User</mat-label>
                <mat-select formControlName="user_type" (selectionChange)="validators(firstFormGroup.value.radio)">
                <mat-option *ngFor="let topping of userTypeList" [value]="topping"
                    >{{topping}}</mat-option
                  >
                </mat-select>
                </mat-form-field>
              </div>
              <div class="col-12 col-md-4">
                <mat-radio-group aria-label="Select an option" formControlName="radio" (change)="validators($event.value)">
                    <mat-radio-button value="1">Option 1</mat-radio-button>
                    <mat-radio-button value="2">Option 2</mat-radio-button>
                  </mat-radio-group>
              </div>
              <div class="col-12 col-lg-4" [ngStyle]="{
                    'visibility': isCityVisible ? 'visible' : 'hidden'
                  }">
              <mat-form-field appearance="outline">
                <mat-label>select City</mat-label>
                <mat-select formControlName="city" multiple>
                  <mat-select-trigger>
                    <mat-chip-listbox>
                      <mat-chip
                        *ngFor="let topping of firstFormGroup.value.city"
                        [removable]="true"
                        (removed)="onCityRemoved(topping)"
                      >
                        {{ getCountryName(topping) }}
                        <mat-icon matChipRemove>cancel</mat-icon>
                      </mat-chip>
                    </mat-chip-listbox>
                  </mat-select-trigger>

                  <mat-option *ngFor="let topping of countryList" [value]="topping.code"
                    >{{topping.name}}</mat-option
                  >
                </mat-select>
                <mat-error >
                      <span *ngIf="firstFormGroup.get('city')?.hasError('required')">city is required.</span>
                    </mat-error>
              </mat-form-field>
              </div>
        <div>
          <button mat-flat-button color="primary" [disabled]="firstFormGroup.invalid" matStepperNext>Next</button>
        </div>
      </form>
    </mat-step>
    <mat-step [stepControl]="secondFormGroup" label="Setup Credentials">
      <form [formGroup]="secondFormGroup">

        <h3>Setup Credentials</h3>
        
        <div class="col-12 col-md-6">
          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>password</mat-label>
            <input [type]="hidePassword ? 'password' : 'text'" matInput formControlName="password" required>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button" aria-label="Toggle password visibility">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="secondFormGroup.get('password')?.errors">
              <span *ngIf="secondFormGroup.get('password')?.hasError('required')">password is required.</span>
              <span *ngIf="secondFormGroup.get('password')?.hasError('pattern')"> Password must be at least 15 characters long, with at least one uppercase
              letter, one lowercase letter, one number  .</span>
              <span *ngIf="secondFormGroup.get('password')?.hasError('passwordContainsPersonalInfo')">  Password should not contain your first name or last name or email.                    </span>
            </mat-error>
          </mat-form-field>
        </div>
        <div class="col-12 col-md-6">
          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>confirm Password</mat-label>
            <input [type]="hideConfirmPassword ? 'password' : 'text'" matInput formControlName="confirmPassword" required>
            <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button" aria-label="Toggle password visibility">
              <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="secondFormGroup.get('confirmPassword')?.errors">
              <span *ngIf="secondFormGroup.get('confirmPassword')?.hasError('required')">password is required.</span>
              <span *ngIf="secondFormGroup.get('confirmPassword')?.hasError('confirmedValidator')">password and confirm password do not match.</span>
            </mat-error>
          </mat-form-field>
        </div>
        <h3>One-Time Password Delivery Methods (At least one Required)</h3>
        <div class="col-12 col-md-6">
          <mat-form-field appearance="outline">
            <mat-label>SMS Phone Number</mat-label>
            <input
              type="tel"
              matInput
              formControlName="smsPhoneNumber"
              (input)="formatPhoneNumber($event)"
              autocomplete="off">
            <mat-error *ngIf="secondFormGroup.get('smsPhoneNumber')?.errors">
              <span *ngIf="secondFormGroup.get('smsPhoneNumber')?.hasError('required')">SMS Phone Number or Vice call Number is required.</span>
              <span *ngIf="secondFormGroup.get('smsPhoneNumber')?.hasError('sameAsVoiceCall')">
                The SMS phone number cannot be the same as the voice call phone number.
              </span>
            </mat-error>
          </mat-form-field>
        </div>
        <div class="col-12 col-md-6">
          <mat-form-field appearance="outline">
            <mat-label>Voice Call Phone Number</mat-label>
            <input
              type="tel"
              matInput
              formControlName="voiceCallPhoneNumber"
              (input)="formatPhoneNumber($event)"
              autocomplete="off">
            <mat-error *ngIf="secondFormGroup.get('voiceCallPhoneNumber')?.errors">
              <span *ngIf="secondFormGroup.get('voiceCallPhoneNumber')?.hasError('required')">SMS Phone Number or Vice call Number is required.</span>
              <span *ngIf="secondFormGroup.get('voiceCallPhoneNumber')?.hasError('sameAsSmsPhone')">
                The voice call phone number cannot be the same as the SMS phone number.
              </span>
            </mat-error>
          </mat-form-field>
        </div>
        <div>
          <button mat-button mat-flat-button matStepperPrevious>Back</button>
          <button mat-button mat-stroked-button color="primary" matStepperNext [disabled]="!this.secondFormGroup.valid">Next</button>
        </div>
      </form>
    </mat-step>
    <mat-step>
      <ng-template matStepLabel>Done</ng-template>
      <p>You are now done.</p>
      <div>
        <button mat-button matStepperPrevious>Back</button>
        <button mat-button (click)="stepper.reset()">Reset</button>
      </div>
    </mat-step>
  </mat-stepper>
  
  
  `,
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  countryList = [
    {
      "code": "AF",
      "name": "Afghanistan",
      "continent": "Asia"
    },
    {
      "code": "AX",
      "name": "Åland Islands",
      "continent": "Europe"
    },
    {
      "code": "AL",
      "name": "Albania",
      "continent": "Europe"
    },
    {
      "code": "DZ",
      "name": "Algeria",
      "continent": "Africa"
    },
    {
      "code": "AS",
      "name": "American Samoa",
      "continent": "Oceania"
    },
    {
      "code": "AD",
      "name": "Andorra",
      "continent": "Europe"
    },
    {
      "code": "AO",
      "name": "Angola",
      "continent": "Africa"
    },
    {
      "code": "AI",
      "name": "Anguilla",
      "continent": "North America"
    },
    {
      "code": "AQ",
      "name": "Antarctica",
      "continent": "Antarctica"
    },
    {
      "code": "AG",
      "name": "Antigua and Barbuda",
      "continent": "North America"
    },
    {
      "code": "AR",
      "name": "Argentina",
      "continent": "South America"
    },
    {
      "code": "AM",
      "name": "Armenia",
      "continent": "Asia"
    },
    {
      "code": "AW",
      "name": "Aruba",
      "continent": "North America"
    },
    {
      "code": "AU",
      "name": "Australia",
      "continent": "Oceania"
    },
    {
      "code": "AT",
      "name": "Austria",
      "continent": "Europe"
    },
    {
      "code": "AZ",
      "name": "Azerbaijan",
      "continent": "Asia"
    },
    {
      "code": "BS",
      "name": "Bahamas",
      "continent": "North America"
    },
    {
      "code": "BH",
      "name": "Bahrain",
      "continent": "Asia"
    },
    {
      "code": "BD",
      "name": "Bangladesh",
      "continent": "Asia"
    },
    {
      "code": "BB",
      "name": "Barbados",
      "continent": "North America"
    },
    {
      "code": "BY",
      "name": "Belarus",
      "continent": "Europe"
    },
    {
      "code": "BE",
      "name": "Belgium",
      "continent": "Europe"
    },
    {
      "code": "BZ",
      "name": "Belize",
      "continent": "North America"
    },
    {
      "code": "BJ",
      "name": "Benin",
      "continent": "Africa"
    },
    {
      "code": "BM",
      "name": "Bermuda",
      "continent": "North America"
    },
    {
      "code": "BT",
      "name": "Bhutan",
      "continent": "Asia"
    },
    {
      "code": "BO",
      "name": "Bolivia (Plurinational State of)",
      "continent": "South America"
    },
    {
      "code": "BA",
      "name": "Bosnia and Herzegovina",
      "continent": "Europe"
    },
    {
      "code": "BW",
      "name": "Botswana",
      "continent": "Africa"
    },
    {
      "code": "BV",
      "name": "Bouvet Island",
      "continent": "Antarctica"
    },
    {
      "code": "BR",
      "name": "Brazil",
      "continent": "South America"
    },
    {
      "code": "IO",
      "name": "British Indian Ocean Territory",
      "continent": "Africa"
    },
    {
      "code": "BN",
      "name": "Brunei Darussalam",
      "continent": "Asia"
    },
    {
      "code": "BG",
      "name": "Bulgaria",
      "continent": "Europe"
    },
    {
      "code": "BF",
      "name": "Burkina Faso",
      "continent": "Africa"
    },
    {
      "code": "BI",
      "name": "Burundi",
      "continent": "Africa"
    },
    {
      "code": "KH",
      "name": "Cambodia",
      "continent": "Asia"
    },
    {
      "code": "CM",
      "name": "Cameroon",
      "continent": "Africa"
    },
    {
      "code": "CA",
      "name": "Canada",
      "continent": "North America"
    },
    {
      "code": "CV",
      "name": "Cape Verde",
      "continent": "Africa"
    },
    {
      "code": "KY",
      "name": "Cayman Islands",
      "continent": "North America"
    },
    {
      "code": "CF",
      "name": "Central African Republic",
      "continent": "Africa"
    },
    {
      "code": "TD",
      "name": "Chad",
      "continent": "Africa"
    },
    {
      "code": "CL",
      "name": "Chile",
      "continent": "South America"
    },
    {
      "code": "CN",
      "name": "China",
      "continent": "Asia"
    },
    {
      "code": "CX",
      "name": "Christmas Island",
      "continent": "Asia"
    },
    {
      "code": "CC",
      "name": "Cocos (Keeling) Islands",
      "continent": "Asia"
    },
    {
      "code": "CO",
      "name": "Colombia",
      "continent": "South America"
    },
    {
      "code": "KM",
      "name": "Comoros",
      "continent": "Africa"
    },
    {
      "code": "CG",
      "name": "Congo",
      "continent": "Africa"
    },
    {
      "code": "CD",
      "name": "Congo, the Democratic Republic of the",
      "continent": "Africa"
    },
    {
      "code": "CK",
      "name": "Cook Islands",
      "continent": "Oceania"
    },
    {
      "code": "CR",
      "name": "Costa Rica",
      "continent": "North America"
    },
    {
      "code": "CI",
      "name": "Côte d'Ivoire",
      "continent": "Africa"
    },
    {
      "code": "HR",
      "name": "Croatia",
      "continent": "Europe"
    },
    {
      "code": "CU",
      "name": "Cuba",
      "continent": "North America"
    },
    {
      "code": "CW",
      "name": "Curaçao",
      "continent": "North America"
    },
    {
      "code": "CY",
      "name": "Cyprus",
      "continent": "Europe"
    },
    {
      "code": "CZ",
      "name": "Czech Republic",
      "continent": "Europe"
    },
    {
      "code": "DK",
      "name": "Denmark",
      "continent": "Europe"
    },
    {
      "code": "DJ",
      "name": "Djibouti",
      "continent": "Africa"
    },
    {
      "code": "DM",
      "name": "Dominica",
      "continent": "North America"
    },
    {
      "code": "DO",
      "name": "Dominican Republic",
      "continent": "North America"
    },
    {
      "code": "EC",
      "name": "Ecuador",
      "continent": "South America"
    },
    {
      "code": "EG",
      "name": "Egypt",
      "continent": "Africa"
    },
    {
      "code": "SV",
      "name": "El Salvador",
      "continent": "North America"
    },
    {
      "code": "GQ",
      "name": "Equatorial Guinea",
      "continent": "Africa"
    },
    {
      "code": "ER",
      "name": "Eritrea",
      "continent": "Africa"
    },
    {
      "code": "EE",
      "name": "Estonia",
      "continent": "Europe"
    },
    {
      "code": "ET",
      "name": "Ethiopia",
      "continent": "Africa"
    },
    {
      "code": "FK",
      "name": "Falkland Islands (Malvinas)",
      "continent": "South America"
    },
    {
      "code": "FO",
      "name": "Faroe Islands",
      "continent": "Europe"
    },
    {
      "code": "FJ",
      "name": "Fiji",
      "continent": "Oceania"
    },
    {
      "code": "FI",
      "name": "Finland",
      "continent": "Europe"
    },
    {
      "code": "FR",
      "name": "France",
      "continent": "Europe"
    },
    {
      "code": "GF",
      "name": "French Guiana",
      "continent": "South America"
    },
    {
      "code": "PF",
      "name": "French Polynesia",
      "continent": "Oceania"
    },
    {
      "code": "TF",
      "name": "French Southern Territories",
      "continent": "Antarctica"
    },
    {
      "code": "GA",
      "name": "Gabon",
      "continent": "Africa"
    },
    {
      "code": "GM",
      "name": "Gambia",
      "continent": "Africa"
    },
    {
      "code": "GE",
      "name": "Georgia",
      "continent": "Asia"
    },
    {
      "code": "DE",
      "name": "Germany",
      "continent": "Europe"
    },
    {
      "code": "GH",
      "name": "Ghana",
      "continent": "Africa"
    },
    {
      "code": "GI",
      "name": "Gibraltar",
      "continent": "Europe"
    },
    {
      "code": "GR",
      "name": "Greece",
      "continent": "Europe"
    },
    {
      "code": "GL",
      "name": "Greenland",
      "continent": "North America"
    },
    {
      "code": "GD",
      "name": "Grenada",
      "continent": "North America"
    },
    {
      "code": "GP",
      "name": "Guadeloupe",
      "continent": "North America"
    },
    {
      "code": "GU",
      "name": "Guam",
      "continent": "Oceania"
    },
    {
      "code": "GT",
      "name": "Guatemala",
      "continent": "North America"
    },
    {
      "code": "GG",
      "name": "Guernsey",
      "continent": "Europe"
    },
    {
      "code": "GN",
      "name": "Guinea",
      "continent": "Africa"
    },
    {
      "code": "GW",
      "name": "Guinea-Bissau",
      "continent": "Africa"
    },
    {
      "code": "GY",
      "name": "Guyana",
      "continent": "South America"
    },
    {
      "code": "HT",
      "name": "Haiti",
      "continent": "North America"
    },
    {
      "code": "HM",
      "name": "Heard Island and McDonald Islands",
      "continent": "Antarctica"
    },
    {
      "code": "VA",
      "name": "Holy See (Vatican City State)",
      "continent": "Europe"
    },
    {
      "code": "HN",
      "name": "Honduras",
      "continent": "North America"
    },
    {
      "code": "HK",
      "name": "Hong Kong",
      "continent": "Asia"
    },
    {
      "code": "HU",
      "name": "Hungary",
      "continent": "Europe"
    },
    {
      "code": "IS",
      "name": "Iceland",
      "continent": "Europe"
    },
    {
      "code": "IN",
      "name": "India",
      "continent": "Asia"
    },
    {
      "code": "ID",
      "name": "Indonesia",
      "continent": "Asia"
    },
    {
      "code": "IR",
      "name": "Iran (Islamic Republic of)",
      "continent": "Asia"
    },
    {
      "code": "IQ",
      "name": "Iraq",
      "continent": "Asia"
    },
    {
      "code": "IE",
      "name": "Ireland",
      "continent": "Europe"
    },
    {
      "code": "IM",
      "name": "Isle of Man",
      "continent": "Europe"
    },
    {
      "code": "IL",
      "name": "Israel",
      "continent": "Asia"
    },
    {
      "code": "IT",
      "name": "Italy",
      "continent": "Europe"
    },
    {
      "code": "JM",
      "name": "Jamaica",
      "continent": "North America"
    },
    {
      "code": "JP",
      "name": "Japan",
      "continent": "Asia"
    },
    {
      "code": "JE",
      "name": "Jersey",
      "continent": "Europe"
    },
    {
      "code": "JO",
      "name": "Jordan",
      "continent": "Asia"
    },
    {
      "code": "KZ",
      "name": "Kazakhstan",
      "continent": "Asia"
    },
    {
      "code": "KE",
      "name": "Kenya",
      "continent": "Africa"
    },
    {
      "code": "KI",
      "name": "Kiribati",
      "continent": "Oceania"
    },
    {
      "code": "KP",
      "name": "Korea (Democratic People's Republic of)",
      "continent": "Asia"
    },
    {
      "code": "KR",
      "name": "Korea, Republic of",
      "continent": "Asia"
    },
    {
      "code": "KW",
      "name": "Kuwait",
      "continent": "Asia"
    },
    {
      "code": "KG",
      "name": "Kyrgyzstan",
      "continent": "Asia"
    },
    {
      "code": "LA",
      "name": "Lao People's Democratic Republic",
      "continent": "Asia"
    },
    {
      "code": "LV",
      "name": "Latvia",
      "continent": "Europe"
    },
    {
      "code": "LB",
      "name": "Lebanon",
      "continent": "Asia"
    },
    {
      "code": "LS",
      "name": "Lesotho",
      "continent": "Africa"
    },
    {
      "code": "LR",
      "name": "Liberia",
      "continent": "Africa"
    },
    {
      "code": "LY",
      "name": "Libya",
      "continent": "Africa"
    },
    {
      "code": "LI",
      "name": "Liechtenstein",
      "continent": "Europe"
    },
    {
      "code": "LT",
      "name": "Lithuania",
      "continent": "Europe"
    },
    {
      "code": "LU",
      "name": "Luxembourg",
      "continent": "Europe"
    },
    {
      "code": "MO",
      "name": "Macao",
      "continent": "Asia"
    },
    {
      "code": "MK",
      "name": "Macedonia (the former Yugoslav Republic of)",
      "continent": "Europe"
    },
    {
      "code": "MG",
      "name": "Madagascar",
      "continent": "Africa"
    },
    {
      "code": "MW",
      "name": "Malawi",
      "continent": "Africa"
    },
    {
      "code": "MY",
      "name": "Malaysia",
      "continent": "Asia"
    },
    {
      "code": "MV",
      "name": "Maldives",
      "continent": "Asia"
    },
    {
      "code": "ML",
      "name": "Mali",
      "continent": "Africa"
    },
    {
      "code": "MT",
      "name": "Malta",
      "continent": "Europe"
    },
    {
      "code": "MH",
      "name": "Marshall Islands",
      "continent": "Oceania"
    },
    {
      "code": "MQ",
      "name": "Martinique",
      "continent": "North America"
    },
    {
      "code": "MR",
      "name": "Mauritania",
      "continent": "Africa"
    },
    {
      "code": "MU",
      "name": "Mauritius",
      "continent": "Africa"
    },
    {
      "code": "MX",
      "name": "Mexico",
      "continent": "North America"
    },
    {
      "code": "FM",
      "name": "Micronesia (Federated States of)",
      "continent": "Oceania"
    },
    {
      "code": "MD",
      "name": "Moldova, Republic of",
      "continent": "Europe"
    },
    {
      "code": "MC",
      "name": "Monaco",
      "continent": "Europe"
    },
    {
      "code": "MN",
      "name": "Mongolia",
      "continent": "Asia"
    },
    {
      "code": "ME",
      "name": "Montenegro",
      "continent": "Europe"
    },
    {
      "code": "MS",
      "name": "Montserrat",
      "continent": "North America"
    },
    {
      "code": "MA",
      "name": "Morocco",
      "continent": "Africa"
    },
    {
      "code": "MZ",
      "name": "Mozambique",
      "continent": "Africa"
    },
    {
      "code": "MM",
      "name": "Myanmar",
      "continent": "Asia"
    },
    {
      "code": "NA",
      "name": "Namibia",
      "continent": "Africa"
    },
    {
      "code": "NR",
      "name": "Nauru",
      "continent": "Oceania"
    },
    {
      "code": "NP",
      "name": "Nepal",
      "continent": "Asia"
    },
    {
      "code": "NL",
      "name": "Netherlands",
      "continent": "Europe"
    },
    {
      "code": "NC",
      "name": "New Caledonia",
      "continent": "Oceania"
    },
    {
      "code": "NZ",
      "name": "New Zealand",
      "continent": "Oceania"
    },
    {
      "code": "NI",
      "name": "Nicaragua",
      "continent": "North America"
    },
    {
      "code": "NE",
      "name": "Niger",
      "continent": "Africa"
    },
    {
      "code": "NG",
      "name": "Nigeria",
      "continent": "Africa"
    },
    {
      "code": "NU",
      "name": "Niue",
      "continent": "Oceania"
    },
    {
      "code": "NF",
      "name": "Norfolk Island",
      "continent": "Oceania"
    },
    {
      "code": "MP",
      "name": "Northern Mariana Islands",
      "continent": "Oceania"
    },
    {
      "code": "NO",
      "name": "Norway",
      "continent": "Europe"
    },
    {
      "code": "OM",
      "name": "Oman",
      "continent": "Asia"
    },
    {
      "code": "PK",
      "name": "Pakistan",
      "continent": "Asia"
    },
    {
      "code": "PW",
      "name": "Palau",
      "continent": "Oceania"
    },
    {
      "code": "PS",
      "name": "Palestine, State of",
      "continent": "Asia"
    },
    {
      "code": "PA",
      "name": "Panama",
      "continent": "North America"
    },
    {
      "code": "PG",
      "name": "Papua New Guinea",
      "continent": "Oceania"
    },
    {
      "code": "PY",
      "name": "Paraguay",
      "continent": "South America"
    },
    {
      "code": "PE",
      "name": "Peru",
      "continent": "South America"
    },
    {
      "code": "PH",
      "name": "Philippines",
      "continent": "Asia"
    },
    {
      "code": "PN",
      "name": "Pitcairn",
      "continent": "Oceania"
    },
    {
      "code": "PL",
      "name": "Poland",
      "continent": "Europe"
    },
    {
      "code": "PT",
      "name": "Portugal",
      "continent": "Europe"
    },
    {
      "code": "PR",
      "name": "Puerto Rico",
      "continent": "North America"
    },
    {
      "code": "QA",
      "name": "Qatar",
      "continent": "Asia"
    },
    {
      "code": "RE",
      "name": "Réunion",
      "continent": "Africa"
    },
    {
      "code": "RO",
      "name": "Romania",
      "continent": "Europe"
    },
    {
      "code": "RU",
      "name": "Russian Federation",
      "continent": "Europe"
    },
    {
      "code": "RW",
      "name": "Rwanda",
      "continent": "Africa"
    },
    {
      "code": "BL",
      "name": "Saint Barthélemy",
      "continent": "North America"
    },
    {
      "code": "SH",
      "name": "Saint Helena, Ascension and Tristan da Cunha",
      "continent": "Africa"
    },
    {
      "code": "KN",
      "name": "Saint Kitts and Nevis",
      "continent": "North America"
    },
    {
      "code": "LC",
      "name": "Saint Lucia",
      "continent": "North America"
    },
    {
      "code": "MF",
      "name": "Saint Martin (French part)",
      "continent": "North America"
    },
    {
      "code": "PM",
      "name": "Saint Pierre and Miquelon",
      "continent": "North America"
    },
    {
      "code": "VC",
      "name": "Saint Vincent and the Grenadines",
      "continent": "North America"
    },
    {
      "code": "WS",
      "name": "Samoa",
      "continent": "Oceania"
    },
    {
      "code": "SM",
      "name": "San Marino",
      "continent": "Europe"
    },
    {
      "code": "ST",
      "name": "Sao Tome and Principe",
      "continent": "Africa"
    },
    {
      "code": "SA",
      "name": "Saudi Arabia",
      "continent": "Asia"
    },
    {
      "code": "SN",
      "name": "Senegal",
      "continent": "Africa"
    },
    {
      "code": "RS",
      "name": "Serbia",
      "continent": "Europe"
    },
    {
      "code": "SC",
      "name": "Seychelles",
      "continent": "Africa"
    },
    {
      "code": "SL",
      "name": "Sierra Leone",
      "continent": "Africa"
    },
    {
      "code": "SG",
      "name": "Singapore",
      "continent": "Asia"
    },
    {
      "code": "SX",
      "name": "Sint Maarten (Dutch part)",
      "continent": "North America"
    },
    {
      "code": "SK",
      "name": "Slovakia",
      "continent": "Europe"
    },
    {
      "code": "SI",
      "name": "Slovenia",
      "continent": "Europe"
    },
    {
      "code": "SB",
      "name": "Solomon Islands",
      "continent": "Oceania"
    },
    {
      "code": "SO",
      "name": "Somalia",
      "continent": "Africa"
    },
    {
      "code": "ZA",
      "name": "South Africa",
      "continent": "Africa"
    },
    {
      "code": "GS",
      "name": "South Georgia and the South Sandwich Islands",
      "continent": "Antarctica"
    },
    {
      "code": "SS",
      "name": "South Sudan",
      "continent": "Africa"
    },
    {
      "code": "ES",
      "name": "Spain",
      "continent": "Europe"
    },
    {
      "code": "LK",
      "name": "Sri Lanka",
      "continent": "Asia"
    },
    {
      "code": "SD",
      "name": "Sudan",
      "continent": "Africa"
    },
    {
      "code": "SR",
      "name": "Suriname",
      "continent": "South America"
    },
    {
      "code": "SJ",
      "name": "Svalbard and Jan Mayen",
      "continent": "Europe"
    },
    {
      "code": "SZ",
      "name": "Swaziland",
      "continent": "Africa"
    },
    {
      "code": "SE",
      "name": "Sweden",
      "continent": "Europe"
    },
    {
      "code": "CH",
      "name": "Switzerland",
      "continent": "Europe"
    },
    {
      "code": "SY",
      "name": "Syrian Arab Republic",
      "continent": "Asia"
    },
    {
      "code": "TW",
      "name": "Taiwan, Province of China",
      "continent": "Asia"
    },
    {
      "code": "TJ",
      "name": "Tajikistan",
      "continent": "Asia"
    },
    {
      "code": "TZ",
      "name": "Tanzania, United Republic of",
      "continent": "Africa"
    },
    {
      "code": "TH",
      "name": "Thailand",
      "continent": "Asia"
    },
    {
      "code": "TL",
      "name": "Timor-Leste",
      "continent": "Asia"
    },
    {
      "code": "TG",
      "name": "Togo",
      "continent": "Africa"
    },
    {
      "code": "TK",
      "name": "Tokelau",
      "continent": "Oceania"
    },
    {
      "code": "TO",
      "name": "Tonga",
      "continent": "Oceania"
    },
    {
      "code": "TT",
      "name": "Trinidad and Tobago",
      "continent": "North America"
    },
    {
      "code": "TN",
      "name": "Tunisia",
      "continent": "Africa"
    },
    {
      "code": "TR",
      "name": "Turkey",
      "continent": "Asia"
    },
    {
      "code": "TM",
      "name": "Turkmenistan",
      "continent": "Asia"
    },
    {
      "code": "TC",
      "name": "Turks and Caicos Islands",
      "continent": "North America"
    },
    {
      "code": "TV",
      "name": "Tuvalu",
      "continent": "Oceania"
    },
    {
      "code": "UG",
      "name": "Uganda",
      "continent": "Africa"
    },
    {
      "code": "UA",
      "name": "Ukraine",
      "continent": "Europe"
    },
    {
      "code": "AE",
      "name": "United Arab Emirates",
      "continent": "Asia"
    },
    {
      "code": "GB",
      "name": "United Kingdom of Great Britain and Northern Ireland",
      "continent": "Europe"
    },
    {
      "code": "US",
      "name": "United States of America",
      "continent": "North America"
    },
    {
      "code": "UM",
      "name": "United States Minor Outlying Islands",
      "continent": "Oceania"
    },
    {
      "code": "UY",
      "name": "Uruguay",
      "continent": "South America"
    },
    {
      "code": "UZ",
      "name": "Uzbekistan",
      "continent": "Asia"
    },
    {
      "code": "VU",
      "name": "Vanuatu",
      "continent": "Oceania"
    },
    {
      "code": "VE",
      "name": "Venezuela (Bolivarian Republic of)",
      "continent": "South America"
    },
    {
      "code": "VN",
      "name": "Viet Nam",
      "continent": "Asia"
    },
    {
      "code": "VG",
      "name": "Virgin Islands (British)",
      "continent": "North America"
    },
    {
      "code": "VI",
      "name": "Virgin Islands (U.S.)",
      "continent": "North America"
    },
    {
      "code": "WF",
      "name": "Wallis and Futuna",
      "continent": "Oceania"
    },
    {
      "code": "EH",
      "name": "Western Sahara",
      "continent": "Africa"
    },
    {
      "code": "YE",
      "name": "Yemen",
      "continent": "Asia"
    },
    {
      "code": "ZM",
      "name": "Zambia",
      "continent": "Africa"
    },
    {
      "code": "ZW",
      "name": "Zimbabwe",
      "continent": "Africa"
    }
  ]

  userTypeList = [
    'worker',
    'consumer'
  ]
  firstFormGroup = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]),
    firstName: this._formBuilder.control('', [Validators.required, Validators.pattern('[a-zA-Z&\\s]*')]),
    lastName: this._formBuilder.control('', [Validators.required, Validators.pattern('[a-zA-Z&\\s]*')]),
    radio: this._formBuilder.control('', Validators.required),
    user_type: this._formBuilder.control('worker'),
    city: this._formBuilder.control([''])
  });
  secondFormGroup = this._formBuilder.group({
    password: this._formBuilder.control('', [
      Validators.required, 
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[~!@#$%^*()/_+\\-`={}|\\[\\];?,.&><\'"]).{15,64}$'),
      this.passwordComplexityValidator(this.firstFormGroup)
    ]),
    confirmPassword: ["", [Validators.required]],
    smsPhoneNumber: ["", [Validators.required]],
    voiceCallPhoneNumber: ["",[Validators.required]]
  },{
    validators: [this.ConfirmedValidator('password', 'confirmPassword'), this.conditionalPhoneValidator()]
  });
  isLinear = false;
  isCityVisible = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private _formBuilder: FormBuilder) {}
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currentCity = model('');
  readonly cities = signal(['']);
  readonly filteredCities = computed(() => {
    const currentCity = this.currentCity().toLowerCase();
    return currentCity
      ? this.countryList.filter(country => country.name.toLowerCase().includes(currentCity))
      : this.countryList.slice();
  });

  readonly announcer = inject(LiveAnnouncer);

  ngOnInit() {
  }

  // Custom validator function to check phone number complexity
  formatPhoneNumber(event: any) {
    const input = event.target.value.replace(/\D/g, ''); // Remove all non-numeric characters
    let formattedNumber = '';
  
    if (input.length <= 3) {
      formattedNumber = input; // If less than or equal to 3 digits, show only digits
    } else if (input.length <= 6) {
      formattedNumber = `${input.slice(0, 3)}-${input.slice(3)}`; // Format as 123-456
    } else {
      formattedNumber = `${input.slice(0, 3)}-${input.slice(3, 6)}-${input.slice(6, 10)}`; // Format as 123-456-7890
    }
  
    event.target.value = formattedNumber; // Set the formatted value back into the input
  }

  conditionalPhoneValidator(): (group: AbstractControl) => ValidationErrors | null {
    return (group: AbstractControl): ValidationErrors | null => {
      const smsPhoneControl = group.get('smsPhoneNumber');
      const voiceCallControl = group.get('voiceCallPhoneNumber');
  
      if (!smsPhoneControl || !voiceCallControl) return null; // Exit if controls are missing

      if (smsPhoneControl.value) {
        voiceCallControl.clearValidators();
      } else {
        voiceCallControl.setValidators(Validators.required);
      }

      if (voiceCallControl.value) {
        smsPhoneControl.clearValidators();
      } else {
        smsPhoneControl.setValidators(Validators.required);
      }

      // Update validity only if changes were made
      smsPhoneControl.updateValueAndValidity({ onlySelf: true });
      voiceCallControl.updateValueAndValidity({ onlySelf: true });

      // Check if both values are the same
      if (smsPhoneControl.value && voiceCallControl.value && smsPhoneControl.value === voiceCallControl.value) {
        smsPhoneControl.setErrors({ sameAsVoiceCall: true });
        voiceCallControl.setErrors({ sameAsSmsPhone: true });
      } else {
        // Clear the errors if they no longer match
        if (smsPhoneControl.hasError('sameAsVoiceCall')) {
          smsPhoneControl.setErrors(null);
        }
        if (voiceCallControl.hasError('sameAsSmsPhone')) {
          voiceCallControl.setErrors(null);
        }
      }

      return null;
      };
  }


// Custom validator function to check password complexity
  passwordComplexityValidator(firstFormGroup: FormGroup): ValidatorFn {
    return (control: AbstractControl) => {
      const password = control.value;

      const firstName = firstFormGroup?.get('firstName')?.value || '';
      const lastName = firstFormGroup?.get('lastName')?.value || '';
      const email = firstFormGroup?.get('email')?.value || '';

      // Check if password contains firstName, lastName, or email (ignoring case)
      if (
        password &&
        (password.toLowerCase().includes(firstName.toLowerCase()) ||
        password.toLowerCase().includes(lastName.toLowerCase()) ||
        password.toLowerCase().includes(email.split('@')[0].toLowerCase())
        )
      ) {
        return { passwordContainsPersonalInfo: true };
      }
      return null; // No error
    };
  }

  // Custom function to check confirm password
  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (matchingControl.errors && !matchingControl.errors['confirmedValidator']) {
            return;
        }
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({confirmedValidator: true});
        } else {
            matchingControl.setErrors(null);
        }
    }
  }
  

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our city
    if (value) {
      this.cities.update(city => [...city, value]);
    }

    // Clear the input value
    this.currentCity.set('');
  }

  remove(city: string): void {
    this.cities.update(cities => {
      const index = cities.indexOf(city);
      if (index < 0) {
        return cities;
      }

      cities.splice(index, 1);
      this.announcer.announce(`Removed ${city}`);
      return [...cities];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.cities.update(city => [...city, event.option.viewValue]);
    this.currentCity.set('');
    event.option.deselect();
  }

  validators(value: any) {
    if ((value == 1 && this.firstFormGroup.value.user_type == 'consumer') || value == 2) {
      this.firstFormGroup.controls["city"].setValidators(Validators.required);
      this.firstFormGroup.controls["city"].markAsTouched();
      this.firstFormGroup.controls["city"].updateValueAndValidity(); 
      this.isCityVisible = true;
    } else {
      this.firstFormGroup.controls["city"].clearValidators();
      this.firstFormGroup.controls["city"].updateValueAndValidity();
      this.isCityVisible = false;
    }
  }
  
  onCityRemoved(cities: any) {
    const city = this.firstFormGroup.value.city as string[];
    this.removeFirst(city, cities);
    this.firstFormGroup.controls["city"].markAsTouched();
    this.firstFormGroup.controls["city"].updateValueAndValidity();
  }

  private removeFirst<T>(array: T[], toRemove: T): void {
    const index = array.indexOf(toRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  getCountryName(value: string) {
    return this.countryList.find((c: any) => c.code == value)?.name;
  }
  

}
