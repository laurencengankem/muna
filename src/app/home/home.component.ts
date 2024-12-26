import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule],
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
