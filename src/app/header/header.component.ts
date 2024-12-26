import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: []
})
export class HeaderComponent implements OnInit {

  numItems=0;
  user= ""
  userRole: any="";

  categoriesBoy = [
    { name: 'Chaussures', route: 'products/male/chaussure' },
    { name: 'Pantalons', route: 'products/male/pantalon' },
    { name: 'Jeans', route: 'products/male/jeans' },
    { name: 'Short', route: 'products/male/short' },
    { name: 'T-shirt', route: 'products/male/t-shirt' },
    { name: 'Blouson', route: 'products/male/blouson' },
  ];
  allCategoryMale = { name: 'Tout', route: 'products/male/tout' };

  categoriesGirl = [
    { name: 'Chaussures', route: 'products/female/chaussure' },
    { name: 'Pantalons', route: 'products/female/pantalon' },
    { name: 'Jupes', route: 'products/female/jupe' },
    { name: 'Robes', route: 'products/female/robe' },
    { name: 'Jeans', route: 'products/female/jeans' },
    { name: 'T-shirt', route: 'products/female/t-shirt' },
    { name: 'Blouson', route: 'products/female/blouson' },
  ];

  allCategoryFemale = { name: 'Tout', route: 'products/female/tout' };
  


  constructor(private router: Router, private cartService: CartService, private userService: UserService){
    
  }

  ngOnInit(): void {
    this.cartService.getCartItemNumber().subscribe(res=>this.numItems=res);
    this.userService.getLoggedUser().subscribe(res=> this.user=res);
    if(!this.userService.isUserlogged()){
      localStorage.removeItem('user');
      localStorage.removeItem('username');
      localStorage.removeItem("userRole");
      this.userService.setLoggedUser('');
    }else{
      this.userRole=localStorage.getItem("userRole");
    }

  }

  goToCart(){
      this.router.navigate(["/cart",{}]);
  }

  logout(){
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('cart');
    this.userService.setLoggedUser('');
    this.cartService.cartItemList=[];
    this.cartService.setCartItemNumber(0);
    window.location.href='/home';
  }
}
