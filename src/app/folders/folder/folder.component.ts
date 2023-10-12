import { Component, Input, OnInit } from '@angular/core';
import { Folder } from './../../model/folder.model';
import { FolderService } from './../../services/folder.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SearchService } from './../../services/search.service';
import { FolderConfirmDialogComponent } from '../../dialog/folder-confirm-dialog/folder-confirm-dialog.component';
import { FolderDialogComponent } from '../../dialog/folder-dialog/folder-dialog.component';
import { FolderShareDialogComponent } from '../../dialog/folder-share-dialog/folder-share-dialog.component';
import { FolderAdminDialogComponent } from '../../dialog/folder-admin-dialog/folder-admin-dialog.component';
import { BasicDialogComponent } from '../../dialog/basic-dialog/basic-dialog.component';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  @Input() folder: Folder;
  @Input() user: string;

  folderSelection: boolean;
  ordering: string = 'alphabetical';

  constructor(private folderService: FolderService,
              private router: Router,
              private dialog: MatDialog,
              public searchService: SearchService,
              public authService: AuthService) { 

               }

  ngOnInit(): void {
  }

  changeOrdering(items: any, ordering: string) {
    if (ordering == 'alphabetical' && this.folder.items) {
      this.ordering = 'alphabetical';
      return items.sort((a, b) => a['title'].localeCompare(b['title']));
    } else
    if (ordering == 'latest') {
      this.ordering = 'latest';
      return items.sort((a, b) => b['createdAt'].localeCompare(a['createdAt']));
    } else
    if (ordering == 'earliest') {
      this.ordering = 'earliest';
      return items.sort((a, b) => a['createdAt'].localeCompare(b['createdAt']));
    }
  }

  openDeleteFolderDialog(uuid: string) {
    const dialogRef = this.dialog.open(FolderConfirmDialogComponent, { 
      data: {
        title: 'Smazat seznam',
        message: 'Opravdu chcete smazat seznam ' + this.folder.name +'?',
        confirm: 'confirm',
        warn: true}, 
      autoFocus: false 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.folderService.deleteFolder(uuid)
        // this.router.navigate(['/folders']);
      }
      // else {
      //   console.log('neni zadano jmeno');
      // }
    });
  }
  openEditFolderDialog(uuid: string) {
    const name = this.folder.name;
    const dialogRef = this.dialog.open(FolderDialogComponent, { 
      data: {
        title: 'Upravit název seznamu',
        message: '',
        name: name,
        button: 'Uložit'}, 
      autoFocus: false });
      
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed', result);
        this.folder.name = result;
        if (result) {
          this.folderService.editFolder(uuid, result)
        }
        if (!result) {
          this.folder.name = name;
        }
        // else {
        //   console.log('neni zadano jmeno');
        // }
      });
  }
  openShareFolderDialog(uuid: string) {
    let folder = {folder: this.folder};
    this.dialog.open(FolderShareDialogComponent, {
      data: folder,
      autoFocus: false
    });
  }
  openAddItemToFolderDialog(uuid: string) {
    const dialogRef = this.dialog.open(FolderDialogComponent, {
      data: {
        title: 'Přidat dokumenty do seznamu',
        message: 'Vlož seznam uuid oddělených čárkou',
        name: '',
        button: 'Přidat'},
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.folderService.addItemsToFolder(uuid, result)
      }
      else {
        console.log('neni zadano jmeno');
      }
    });
  }
  openUnfollowFolderDialog(folder: Folder) {
    const dialogRef = this.dialog.open(FolderConfirmDialogComponent, { 
      data: {
        title: 'Přestat sledovat seznam',
        message: 'Opravdu chcete přestat sledovat seznam ' + this.folder.name +'?',
        confirm: 'confirm',
        warn: true}, 
      autoFocus: false 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.folderService.unfollowFolder(folder.uuid);
        folder.user = undefined;
      }
      else {
        console.log('no result');
      }
    });
  }
  openFollowFolderDialog(folder: Folder) {
    console.log('folder', folder);
    const dialogRef = this.dialog.open(FolderConfirmDialogComponent, { 
      data: {
        title: 'Sledovat seznam',
        message: 'Opravdu chcete sledovat seznam ' + this.folder.name +'?',
        confirm: 'confirm'}, 
      autoFocus: false 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        folder.user = 'follower';
        this.folderService.followFolder(folder);
      }
      else {
        console.log('no result');
      }
    });
  }
  toggleFolderSelection() {
    if (this.folder) {
      for (const item of this.folder.items) {
        console.log('item', item);
        // item.selected = false;
      }
    }
    this.folderSelection = !this.folderSelection;
  }
  toggleAllSelected() {
    let allSelected = true;
    for (const item of this.folder.items) {
        if (!item.selected) {
            allSelected = false;
            break
        }
    }
    for (const item of this.folder.items) {
        item.selected = !allSelected;
    }
  }
  openAdminActions() {
    const uuids = [];
    for (const item of this.folder.items) {
      if (item.selected) {
        uuids.push(item.uuid);
      }
    }
    const data = {
      uuids: uuids,
      title: 'Hromadné mazání dokumentů',
      message: 'Chcete smazat vybrané dokumenty ze seznamu?',
    }
    const dialogRef = this.dialog.open(FolderAdminDialogComponent, { data: data, autoFocus: false });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.folderService.removeItemsFromFolder(this.folder.uuid, uuids);
        this.folder.items = this.folder.items.filter(item => !uuids.includes(item.uuid));
      }
      else {
        console.log('no uuids');
      }
    });
  }
  openBasicDialog() {
    const dialogRef = this.dialog.open(BasicDialogComponent, { 
      data: {
        title: 'Sdílení seznamu',
        message: 'Pro přidání seznamu '  + this.folder.name + ' se musíte přihlásit.',
        button: 'OK'}, 
      autoFocus: false 
    });
  }
}
