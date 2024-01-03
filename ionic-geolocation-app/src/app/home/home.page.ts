import { Component, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  latitude: any = 0;
  longitude: any = 0;

  constructor(
    private geolocation: Geolocation,
    private firestore: AngularFirestore // Agrega esta línea
  ) {}

  options = {
    timeout: 10000,
    enableHighAccuracy: true,
    maximumAge: 3600,
  };

  getCurrentCoordinates() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      // Llama a la función para guardar las coordenadas en Firebase
      this.saveCoordinatesToFirebase(this.latitude, this.longitude);
    }).catch((error) => {
      console.log('Error, no se puede obtener tu ubicación', error);
    });
  }

  // Función para guardar las coordenadas en Firebase
  saveCoordinatesToFirebase(latitude: number, longitude: number) {
    this.firestore.collection('ubicaciones').add({
      latitude: latitude,
      longitude: longitude,
      timestamp: new Date(),
    }).then((docRef) => {
      console.log('Coordenadas guardadas en Firebase con ID:', docRef.id);
    }).catch((error) => {
      console.error('Error al guardar las coordenadas en Firebase:', error);
    });
  }

  openGoogleMaps() {
    // Abre Google Maps con las coordenadas actuales
    window.open(`https://www.google.com/maps?q=${this.latitude},${this.longitude}`, '_system');
  }
}
