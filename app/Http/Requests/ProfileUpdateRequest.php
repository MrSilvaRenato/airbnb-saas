<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'                 => ['required', 'string', 'max:255'],
            'email'                => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
            'notify_on_guest_view' => ['nullable', 'boolean'],
            'tagline'              => ['nullable', 'string', 'max:160'],
            'bio'                  => ['nullable', 'string', 'max:1000'],
            'location'             => ['nullable', 'string', 'max:120'],
            'website'              => ['nullable', 'url', 'max:255'],
            'phone'                => ['nullable', 'string', 'max:40'],
            'profile_photo'        => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];
    }
}
