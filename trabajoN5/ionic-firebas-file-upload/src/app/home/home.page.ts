import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

export interface FileDetails {
  name: string;
  filepath: string;
  size: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // File upload task
  fileUploadTask: AngularFireUploadTask;
  // Upload progress
  percentageVal: Observable<any>;
  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;
  // Uploaded File URL
  UploadedFileURL: Observable<string>;
  // Uploaded image collection
  files: Observable<FileDetails[]>;
  // File specifications
  fileName: string;
  fileSize: number;
  // File uploading status
  isFileUploading: boolean;
  isFileUploaded: boolean;
  private filesCollection: AngularFirestoreCollection<FileDetails>;

  constructor(
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {
    this.isFileUploading = false;
    this.isFileUploaded = false;
    // Define uploaded files collection
    this.filesCollection = afs.collection<FileDetails>('filesCollection');
    this.files = this.filesCollection.valueChanges();
  }

  uploadFile(event: FileList, fileType: string) {
    const file: any = event.item(0);
    
    // File validation based on type
    if (fileType === 'image' && file.type.split('/')[0] !== 'image') {
      console.log('File type is not supported!');
      return;
    } else if (fileType === 'txt' && file.type !== 'text/plain') {
      console.log('File type is not supported!');
      return;
    } else if (fileType === 'pdf' && file.type !== 'application/pdf') {
      console.log('File type is not supported!');
      return;
    }

    this.isFileUploading = true;
    this.isFileUploaded = false;
    this.fileName = file.name;
    // Storage path
    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;
    // File reference
    const fileRef = this.afStorage.ref(fileStoragePath);
    // File upload task
    this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);
    // Show uploading progress
    this.percentageVal = this.fileUploadTask.percentageChanges();
    this.trackSnapshot = this.fileUploadTask.snapshotChanges().pipe(
      finalize(() => {
        // Retrieve uploaded file storage path
        this.UploadedFileURL = fileRef.getDownloadURL();
        this.UploadedFileURL.subscribe(
          (resp) => {
            this.storeFilesFirebase({
              name: file.name,
              filepath: resp,
              size: this.fileSize,
            });
            this.isFileUploading = false;
            this.isFileUploaded = true;
          },
          (error) => {
            console.log(error);
          }
        );
      }),
      tap((snap: any) => {
        this.fileSize = snap.totalBytes;
      })
    );
  }

  storeFilesFirebase(file: FileDetails) {
    const fileId = this.afs.createId();
    this.filesCollection
      .doc(fileId)
      .set(file)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
