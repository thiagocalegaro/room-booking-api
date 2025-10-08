import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class ExcluirExcecaoGlobalDto {
    @IsDateString()
  @IsNotEmpty()
  inicio: string;

  @IsDateString()
  @IsNotEmpty()
  fim: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;
}