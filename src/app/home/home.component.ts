import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  userRole: any='';

  constructor(private router:Router, private userService: UserService){

  }
  ngOnInit(): void {
    if(this.userService.isUserlogged()){
      this.userRole=localStorage.getItem("userRole");
    }
  
  }

  viewProducts(){
    this.router.navigate(['/products',{}]);
  }
}
