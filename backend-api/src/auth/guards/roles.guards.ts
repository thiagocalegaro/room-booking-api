import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../usuarios/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Se a rota não precisa de nenhum papel, libera o acesso
    }
    const { user } = context.switchToHttp().getRequest();

    // A mágica acontece aqui: verifica se algum dos papéis exigidos
    // corresponde ao papel do usuário logado (que veio do JWT)
    return requiredRoles.some((role) => user.tipo === role);
  }
}