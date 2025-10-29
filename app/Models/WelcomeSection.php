<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class WelcomeSection extends Model {
    protected $fillable = ['welcome_package_id','type','title','body','sort_order'];
    public function package(){ return $this->belongsTo(WelcomePackage::class,'welcome_package_id'); }
}
