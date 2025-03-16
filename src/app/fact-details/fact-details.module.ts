import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FactDetailsComponent } from './fact-details.component';
import { FormsModule } from '@angular/forms';
import { FactDetailsRoutingModule } from './fact-details-routing.module';

@NgModule({
  declarations: [FactDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FactDetailsRoutingModule
],
})


export class FactDetailsModule { }
