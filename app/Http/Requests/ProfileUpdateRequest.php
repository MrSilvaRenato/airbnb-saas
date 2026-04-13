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
            'phone'                => ['nullable', 'string', 'max:40'],
            'business_name'        => ['nullable', 'string', 'max:255'],
            'host_display_name'    => ['nullable', 'string', 'max:255'],
            'profile_bio'          => ['nullable', 'string', 'max:2000'],
            'brand_logo_file'      => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'remove_brand_logo'    => ['nullable', 'boolean'],
            'notify_on_guest_view' => ['nullable', 'boolean'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }
}
