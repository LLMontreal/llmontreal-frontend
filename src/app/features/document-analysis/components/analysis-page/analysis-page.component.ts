import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SummaryComponent } from '../../ui/summary/summary.component';
import { ChatComponent } from '../../ui/chat/chat.component';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [
    SummaryComponent,
    ChatComponent
  ],
  templateUrl: './analysis-page.component.html',
  styleUrls: ['./analysis-page.component.scss']
})
export class AnalysisPageComponent implements OnInit {
  
  documentId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Chave: Lê o parâmetro 'id' da URL no momento em que a página carrega.
    this.documentId = this.route.snapshot.paramMap.get('id');
    console.log('PÁGINA DE ANÁLISE: Carregada para o documento com ID:', this.documentId);
  }
}