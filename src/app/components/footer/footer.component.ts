import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  projectUrl = encodeURIComponent('https://llmontreal.com'); // URL para compartilhamento

  facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${this.projectUrl}`;
  twitterShare = `https://twitter.com/intent/tweet?url=${this.projectUrl}&text=Confira%20este%20projeto!`;
  linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${this.projectUrl}`;
}

