<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL');
        $password = env('SUPER_ADMIN_PASSWORD');
        $name = env('SUPER_ADMIN_NAME', 'Super Admin');

        if (!$email || !$password) {
            $this->command->warn('SUPER_ADMIN_EMAIL o SUPER_ADMIN_PASSWORD no definidos. Seeder omitido.');
            return;
        }

        User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super Admin verificado/creado correctamente.');
        $this->command->info("Email: {$email}");
        $this->command->warn('La contraseña no se imprime por seguridad.');
    }
}
