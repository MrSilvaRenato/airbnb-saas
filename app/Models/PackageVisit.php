<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PackageVisit extends Model {
    protected $fillable = ['welcome_package_id','client','visited_at'];
    public function package(){ return $this->belongsTo(WelcomePackage::class,'welcome_package_id'); }
}
