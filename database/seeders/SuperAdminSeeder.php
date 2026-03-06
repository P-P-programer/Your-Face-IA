<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'felipemendoza3247@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Adminsecure32*'),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info(' Super Admin creado:');
        $this->command->info(' Email: felipemendoza3247@gmail.com');
        $this->command->info(' Password: Adminsecure32*');
        $this->command->warn('  CAMBIA LA CONTRASEÑA INMEDIATAMENTE');
    }
}
