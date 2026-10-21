import os
import shutil
import hashlib
import json

src_root = '/Users/v003006/Desktop/NCNang/image/Set 165k'
dest_root = '/Users/v003006/Desktop/NCNang/image/Set 165k (Phan loai chi tiet)'

# 1. Exact Duplicates Removal
# Find duplicates
hashes = {}
duplicates = []
unique_files = []

for dirpath, _, filenames in os.walk(src_root):
    for f in filenames:
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')) and not f.startswith('.'):
            p = os.path.join(dirpath, f)
            with open(p, 'rb') as fp:
                h = hashlib.md5(fp.read()).hexdigest()
            if h in hashes:
                duplicates.append((p, hashes[h]))
            else:
                hashes[h] = p
                unique_files.append(p)

unique_files.sort()
print(f"Total images scanned: {len(unique_files) + len(duplicates)}")
print(f"Duplicates to delete: {len(duplicates)}")

# Permanently delete duplicates as requested
for dup_path, orig in duplicates:
    print(f"Deleting duplicate: {os.path.basename(dup_path)} (duplicate of {os.path.basename(orig)})")
    if os.path.exists(dup_path):
        os.remove(dup_path)

# Clean and re-create destination
if os.path.exists(dest_root):
    shutil.rmtree(dest_root)

# Remove old basic classification folder if exists
old_classified = '/Users/v003006/Desktop/NCNang/image/Set 165k (Da phan loai)'
if os.path.exists(old_classified):
    shutil.rmtree(old_classified)

# Detailed mapping for all 157 unique items (1-indexed matching contact sheets)
TAGS = {
    1: {"name": "caro_xanh_gau_cute", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    2: {"name": "caro_to_den_trang", "colors": ["Xam_Ghi_Den", "Trang_Kem_Be"], "patterns": ["Ke_Caro"], "tones": ["Hien_Dai_Toi_Gian"]},
    3: {"name": "ke_soc_pastel_dong_vat", "colors": ["Hong_Do_Dao", "Xanh_Duong_Pastel"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    4: {"name": "ke_soc_ghi_xam_dui_xuoc", "colors": ["Xam_Ghi_Den"], "patterns": ["Ke_Soc", "Tron_Toi_Gian"], "tones": ["Hien_Dai_Toi_Gian"]},
    5: {"name": "be_am_mat_gau_nau", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    6: {"name": "hoa_cuc_nhi_vang_kem", "colors": ["Vang_Cam", "Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    7: {"name": "hinh_hoc_ziczac_xanh_duong", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Hinh_Hoc_Truu_Tuong"], "tones": ["Hien_Dai_Toi_Gian"]},
    8: {"name": "ghi_xam_hoa_nhi_trang", "colors": ["Xam_Ghi_Den"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Hien_Dai_Toi_Gian", "Vintage_Retro_Co_Dien"]},
    9: {"name": "hoa_la_cam_dao_vintage", "colors": ["Hong_Do_Dao", "Vang_Cam", "Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    10: {"name": "hoa_nhi_hong_be_vintage", "colors": ["Hong_Do_Dao", "Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    11: {"name": "trai_tim_nho_hong_phan", "colors": ["Hong_Do_Dao"], "patterns": ["Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    12: {"name": "banh_mi_gau_biscuit_kem", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Am_Ap_Earthy"]},
    13: {"name": "ke_soc_vang_gau_pooh", "colors": ["Vang_Cam"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    14: {"name": "hoa_tulip_nhi_vang_kem", "colors": ["Vang_Cam", "Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    15: {"name": "tho_gau_tim_pastel_be", "colors": ["Trang_Kem_Be", "Tim_Lavender"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    16: {"name": "caro_hong_cam_pastel", "colors": ["Hong_Do_Dao", "Vang_Cam"], "patterns": ["Ke_Caro"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    17: {"name": "dau_tay_hoa_qua_hong_dao", "colors": ["Hong_Do_Dao"], "patterns": ["Hoa_Nhi_Hoa_Co", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    18: {"name": "hoa_nhi_li_ti_kem_vang", "colors": ["Trang_Kem_Be", "Vang_Cam"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    19: {"name": "tim_khoai_mon_tron_dui", "colors": ["Tim_Lavender"], "patterns": ["Tron_Toi_Gian"], "tones": ["Hien_Dai_Toi_Gian"]},
    20: {"name": "non_sinh_nhat_gau_con", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    21: {"name": "caro_nau_gau_teddy_vintage", "colors": ["Nau_Dat_Cafe"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    22: {"name": "tau_xe_giao_thong_do_trang", "colors": ["Hong_Do_Dao", "Trang_Kem_Be"], "patterns": ["Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    23: {"name": "sao_nho_tron_hong_phan", "colors": ["Hong_Do_Dao"], "patterns": ["Tron_Toi_Gian"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    24: {"name": "hoa_nhi_cuc_vang_dat_vintage", "colors": ["Nau_Dat_Cafe", "Vang_Cam"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    25: {"name": "ngoi_sao_hoa_nhi_xam_trang", "colors": ["Trang_Kem_Be", "Xam_Ghi_Den"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Hien_Dai_Toi_Gian"]},
    26: {"name": "hoa_nhi_tim_lavender_vintage", "colors": ["Tim_Lavender"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    27: {"name": "ke_soc_tao_do_dau_tay", "colors": ["Trang_Kem_Be", "Hong_Do_Dao"], "patterns": ["Ke_Soc", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    28: {"name": "ke_soc_nau_cun_con_cute", "colors": ["Nau_Dat_Cafe", "Xanh_Duong_Pastel"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Am_Ap_Earthy"]},
    29: {"name": "caro_xanh_duong_gau_nho", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    30: {"name": "gau_dau_hong_phan", "colors": ["Hong_Do_Dao"], "patterns": ["Gau_Dong_Vat", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    31: {"name": "ngua_go_gau_vang_soc_nho", "colors": ["Vang_Cam", "Trang_Kem_Be"], "patterns": ["Hoat_Hinh_Tre_Em", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    32: {"name": "cho_dom_cun_con_be_trang", "colors": ["Trang_Kem_Be", "Xam_Ghi_Den"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    33: {"name": "banh_mi_cookie_gau_kem", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Am_Ap_Earthy"]},
    34: {"name": "gau_banh_kem_vang_vintage", "colors": ["Vang_Cam", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat", "Hoat_Hinh_Tre_Em"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    35: {"name": "tam_giac_co_banh_kem_dau_vang", "colors": ["Vang_Cam", "Hong_Do_Dao"], "patterns": ["Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    36: {"name": "tho_cam_bac_au_tuan_loc_nhạt", "colors": ["Trang_Kem_Be", "Hong_Do_Dao"], "patterns": ["Hinh_Hoc_Truu_Tuong", "Hoat_Hinh_Tre_Em"], "tones": ["Vintage_Retro_Co_Dien"]},
    37: {"name": "caro_tim_pastel_gau_nho", "colors": ["Tim_Lavender", "Trang_Kem_Be"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    38: {"name": "hoa_nhi_hong_tho_tim_nhạt", "colors": ["Hong_Do_Dao", "Tim_Lavender"], "patterns": ["Hoa_Nhi_Hoa_Co", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    39: {"name": "caro_xanh_da_troi_no_nho", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Caro", "Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    40: {"name": "ke_soc_nau_cun_con_can_canh", "colors": ["Nau_Dat_Cafe"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    41: {"name": "hoa_nhi_hong_phan_diu_dang", "colors": ["Hong_Do_Dao"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    42: {"name": "dau_tay_do_mong_nen_kem", "colors": ["Hong_Do_Dao", "Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    43: {"name": "ke_soc_nau_cun_con_goc_nghieng", "colors": ["Nau_Dat_Cafe"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy"]},
    44: {"name": "hoa_nhi_xanh_mint_bo_vintage", "colors": ["Xanh_La_Mint"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    45: {"name": "tho_gau_nau_hong_pastel", "colors": ["Hong_Do_Dao"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    46: {"name": "hoa_nhi_tim_kem_no", "colors": ["Tim_Lavender"], "patterns": ["Hoa_Nhi_Hoa_Co", "Trai_Tim_No"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    47: {"name": "sanrio_hoat_hinh_sac_mau", "colors": ["Trang_Kem_Be", "Hong_Do_Dao", "Vang_Cam"], "patterns": ["Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    48: {"name": "caro_xam_nau_cun_gau", "colors": ["Xam_Ghi_Den", "Nau_Dat_Cafe"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Vintage_Retro_Co_Dien"]},
    49: {"name": "hoa_day_vintage_be_dat", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    50: {"name": "ke_soc_tho_cam_ghi_xam", "colors": ["Xam_Ghi_Den"], "patterns": ["Ke_Soc", "Hinh_Hoc_Truu_Tuong"], "tones": ["Vintage_Retro_Co_Dien", "Hien_Dai_Toi_Gian"]},
    51: {"name": "gau_pooh_banh_ngot_vang_kem", "colors": ["Vang_Cam"], "patterns": ["Gau_Dong_Vat", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    52: {"name": "xam_ghi_cham_hoa_nhi_trang", "colors": ["Xam_Ghi_Den"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Hien_Dai_Toi_Gian"]},
    53: {"name": "hoa_cuc_hoa_mi_xam_xanh", "colors": ["Xam_Ghi_Den", "Xanh_Duong_Pastel"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    54: {"name": "cham_sao_den_nho_nen_kem", "colors": ["Trang_Kem_Be", "Xam_Ghi_Den"], "patterns": ["Hinh_Hoc_Truu_Tuong"], "tones": ["Hien_Dai_Toi_Gian"]},
    55: {"name": "hello_kitty_tim_mong_mo", "colors": ["Tim_Lavender"], "patterns": ["Hoat_Hinh_Tre_Em", "Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    56: {"name": "caro_do_tuoi_hello_kitty", "colors": ["Hong_Do_Dao"], "patterns": ["Ke_Caro", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    57: {"name": "caro_hong_no_buom_cute", "colors": ["Hong_Do_Dao"], "patterns": ["Ke_Caro", "Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    58: {"name": "ke_soc_pastel_sanrio_tho_meo", "colors": ["Trang_Kem_Be", "Hong_Do_Dao", "Xanh_Duong_Pastel"], "patterns": ["Ke_Soc", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    59: {"name": "hoa_nhi_nau_be_dong_que", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    60: {"name": "hoa_nhi_xanh_duong_pastel", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    61: {"name": "dong_vat_thu_cung_vang_kem", "colors": ["Vang_Cam"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    62: {"name": "caro_be_snoopy_cun_con", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    63: {"name": "no_den_nho_trang_xam", "colors": ["Trang_Kem_Be", "Xam_Ghi_Den"], "patterns": ["Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Hien_Dai_Toi_Gian"]},
    64: {"name": "ke_soc_xanh_da_troi_gau", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    65: {"name": "cham_bi_trang_nau_socola_dui", "colors": ["Nau_Dat_Cafe"], "patterns": ["Trai_Tim_No"], "tones": ["Am_Ap_Earthy", "Vintage_Retro_Co_Dien"]},
    66: {"name": "ke_soc_gau_xanh_reu_mint", "colors": ["Xanh_La_Mint"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    67: {"name": "caro_hong_tim_pastel", "colors": ["Hong_Do_Dao", "Tim_Lavender"], "patterns": ["Ke_Caro"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    68: {"name": "ke_soc_xanh_qua_bo_cun", "colors": ["Xanh_La_Mint"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy"]},
    69: {"name": "caro_be_nau_vintage_co_dien", "colors": ["Nau_Dat_Cafe", "Trang_Kem_Be"], "patterns": ["Ke_Caro"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    70: {"name": "ke_soc_xanh_reu_gau_nau", "colors": ["Xanh_La_Mint", "Nau_Dat_Cafe"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Vintage_Retro_Co_Dien"]},
    71: {"name": "meo_den_cun_cung_nen_be", "colors": ["Trang_Kem_Be", "Xam_Ghi_Den"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    72: {"name": "ke_soc_vang_khi_con_chuoi", "colors": ["Vang_Cam"], "patterns": ["Ke_Soc", "Hoat_Hinh_Tre_Em", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    73: {"name": "gau_teddy_cham_bi_nau_sua", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    74: {"name": "gau_nau_nen_nau_dat_hat_de", "colors": ["Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Vintage_Retro_Co_Dien"]},
    75: {"name": "chan_caro_do_trang_dau_tay", "colors": ["Hong_Do_Dao", "Trang_Kem_Be"], "patterns": ["Ke_Caro", "Hoa_Nhi_Hoa_Co"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Vintage_Retro_Co_Dien"]},
    76: {"name": "chan_hoa_nhi_be_kem_vintage", "colors": ["Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    77: {"name": "caro_cau_vong_pastel_dau_tay", "colors": ["Trang_Kem_Be", "Hong_Do_Dao", "Vang_Cam", "Xanh_Duong_Pastel"], "patterns": ["Ke_Caro", "Hoa_Nhi_Hoa_Co"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    78: {"name": "chan_hoat_hinh_banh_kem_be_hong", "colors": ["Trang_Kem_Be", "Hong_Do_Dao"], "patterns": ["Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    79: {"name": "chan_hoa_nhi_nau_be_co_dien", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    80: {"name": "chan_gau_pooh_vang_kem", "colors": ["Vang_Cam"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    81: {"name": "ke_soc_no_hoa_nhi_nau_kem", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Ke_Soc", "Trai_Tim_No", "Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    82: {"name": "chan_gau_nau_xam", "colors": ["Nau_Dat_Cafe", "Xam_Ghi_Den"], "patterns": ["Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy"]},
    83: {"name": "chan_hoa_cuc_nau_cam_vintage", "colors": ["Nau_Dat_Cafe", "Vang_Cam"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    84: {"name": "chan_caro_nau_dam_co_dien", "colors": ["Nau_Dat_Cafe"], "patterns": ["Ke_Caro"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    85: {"name": "caro_cun_con_xanh_be", "colors": ["Xanh_Duong_Pastel", "Trang_Kem_Be"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    86: {"name": "chan_cuon_ke_soc_pastel", "colors": ["Trang_Kem_Be", "Hong_Do_Dao", "Xanh_Duong_Pastel"], "patterns": ["Ke_Soc"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    87: {"name": "chan_caro_xanh_nhat_cun_gau", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    88: {"name": "chan_gau_banh_mi_cham_kem", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    89: {"name": "chan_trai_tim_pixel_hong_dat", "colors": ["Hong_Do_Dao"], "patterns": ["Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Vintage_Retro_Co_Dien"]},
    90: {"name": "chan_xam_ghi_cham_sao", "colors": ["Xam_Ghi_Den"], "patterns": ["Hinh_Hoc_Truu_Tuong", "Tron_Toi_Gian"], "tones": ["Hien_Dai_Toi_Gian"]},
    91: {"name": "chan_cuon_hoa_nhi_cuc_vang_xanh", "colors": ["Vang_Cam", "Xanh_La_Mint"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    92: {"name": "chan_hoa_nhi_nen_kem", "colors": ["Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    93: {"name": "chan_caro_hong_phan_no_buom", "colors": ["Hong_Do_Dao"], "patterns": ["Ke_Caro", "Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    94: {"name": "chan_hoat_hinh_banh_kem_be_hong_2", "colors": ["Trang_Kem_Be", "Hong_Do_Dao"], "patterns": ["Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    95: {"name": "chan_soc_tho_cam_hong_nau", "colors": ["Hong_Do_Dao", "Nau_Dat_Cafe"], "patterns": ["Ke_Soc", "Hinh_Hoc_Truu_Tuong"], "tones": ["Vintage_Retro_Co_Dien"]},
    96: {"name": "bo_hoa_nhi_xanh_mint_xam_nhat", "colors": ["Xanh_La_Mint", "Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    97: {"name": "chan_sanrio_kuromi_kem_vang", "colors": ["Vang_Cam", "Hong_Do_Dao"], "patterns": ["Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    98: {"name": "chan_gau_pooh_banh_ngot_vang", "colors": ["Vang_Cam"], "patterns": ["Gau_Dong_Vat", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    99: {"name": "chan_van_hinh_hoc_ziczac_ghi", "colors": ["Xam_Ghi_Den"], "patterns": ["Hinh_Hoc_Truu_Tuong"], "tones": ["Hien_Dai_Toi_Gian"]},
    100: {"name": "chan_hoa_nhi_hong_dao_kem", "colors": ["Hong_Do_Dao", "Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    101: {"name": "chan_hoa_nhi_be_nau_hat_de", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    102: {"name": "chan_dui_moc_nau_be_cham_bi", "colors": ["Nau_Dat_Cafe", "Trang_Kem_Be"], "patterns": ["Trai_Tim_No", "Tron_Toi_Gian"], "tones": ["Am_Ap_Earthy"]},
    103: {"name": "chan_trai_tim_pixel_hong_phan", "colors": ["Hong_Do_Dao"], "patterns": ["Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    104: {"name": "dan_cuon_chan_ga_da_sac", "colors": ["Trang_Kem_Be", "Xanh_Duong_Pastel", "Hong_Do_Dao", "Nau_Dat_Cafe"], "patterns": ["Tron_Toi_Gian"], "tones": ["Am_Ap_Earthy"]},
    105: {"name": "chan_caro_nau_phoi_no", "colors": ["Nau_Dat_Cafe"], "patterns": ["Ke_Caro", "Trai_Tim_No"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    106: {"name": "chan_xuong_rong_hoa_nhi_vang_kem", "colors": ["Vang_Cam", "Xanh_La_Mint"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    107: {"name": "chan_cuon_hoa_nhi_xanh_xam_vintage", "colors": ["Xam_Ghi_Den", "Xanh_Duong_Pastel"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    108: {"name": "chan_cuon_caro_xanh_cun_gau", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    109: {"name": "chong_cuon_vai_dui_pastel", "colors": ["Xanh_Duong_Pastel", "Trang_Kem_Be"], "patterns": ["Ke_Caro", "Tron_Toi_Gian"], "tones": ["Hien_Dai_Toi_Gian"]},
    110: {"name": "chan_hoa_nhi_tim_lavender", "colors": ["Tim_Lavender"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    111: {"name": "bo_tim_caro_cun_con_gau_bong", "colors": ["Tim_Lavender"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    112: {"name": "chan_soc_tho_cam_bac_au_nhat", "colors": ["Trang_Kem_Be", "Hong_Do_Dao"], "patterns": ["Ke_Soc", "Hinh_Hoc_Truu_Tuong"], "tones": ["Vintage_Retro_Co_Dien"]},
    113: {"name": "chan_caro_xanh_gau_teddy", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    114: {"name": "chan_trai_hoa_nhi_vang_cuc", "colors": ["Vang_Cam", "Nau_Dat_Cafe"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    115: {"name": "chong_nhieu_chan_dui_gap_cuon", "colors": ["Trang_Kem_Be", "Hong_Do_Dao", "Xam_Ghi_Den"], "patterns": ["Hoa_Nhi_Hoa_Co", "Ke_Caro"], "tones": ["Am_Ap_Earthy"]},
    116: {"name": "bo_chan_goi_ghi_xam_mat_gau", "colors": ["Xam_Ghi_Den"], "patterns": ["Gau_Dong_Vat"], "tones": ["Hien_Dai_Toi_Gian", "Am_Ap_Earthy"]},
    117: {"name": "chan_cuon_ke_soc_pastel_cau_vong", "colors": ["Trang_Kem_Be", "Hong_Do_Dao", "Xanh_Duong_Pastel"], "patterns": ["Ke_Soc"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    118: {"name": "chan_trai_tim_hong_phan_cute", "colors": ["Hong_Do_Dao"], "patterns": ["Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    119: {"name": "patchwork_caro_hong_tim_vintage", "colors": ["Hong_Do_Dao", "Nau_Dat_Cafe"], "patterns": ["Ke_Caro", "Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Vintage_Retro_Co_Dien"]},
    120: {"name": "chan_cun_con_den_trang_cute", "colors": ["Trang_Kem_Be", "Xam_Ghi_Den"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    121: {"name": "chan_patchwork_caro_hong_tim", "colors": ["Hong_Do_Dao"], "patterns": ["Ke_Caro", "Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    122: {"name": "bo_chan_goi_cuon_xanh_mint_gau", "colors": ["Xanh_La_Mint", "Xanh_Duong_Pastel"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    123: {"name": "chan_gau_pooh_vang_kem_am_ap", "colors": ["Vang_Cam"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    124: {"name": "bo_ke_soc_pastel_nhieu_mau", "colors": ["Trang_Kem_Be", "Hong_Do_Dao", "Xanh_Duong_Pastel"], "patterns": ["Ke_Soc"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    125: {"name": "cho_cun_gau_xam_ghi_sang", "colors": ["Xam_Ghi_Den"], "patterns": ["Gau_Dong_Vat"], "tones": ["Hien_Dai_Toi_Gian", "Han_Quoc_Cute_Dang_Yeu"]},
    126: {"name": "gau_teddy_hoa_qua_be_kem", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    127: {"name": "cun_con_snoopy_sac_mau", "colors": ["Trang_Kem_Be", "Vang_Cam", "Xanh_Duong_Pastel"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    128: {"name": "gau_bac_cuc_tho_xam_be_sua", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    129: {"name": "no_buom_nau_xinh_ghi_xam", "colors": ["Xam_Ghi_Den", "Trang_Kem_Be"], "patterns": ["Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Hien_Dai_Toi_Gian"]},
    130: {"name": "ke_soc_chim_canh_cut_gau_tuyet", "colors": ["Trang_Kem_Be", "Xanh_Duong_Pastel"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    131: {"name": "caro_gau_nau_xam_ghi", "colors": ["Xam_Ghi_Den", "Nau_Dat_Cafe"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Vintage_Retro_Co_Dien", "Hien_Dai_Toi_Gian"]},
    132: {"name": "ke_soc_cun_gau_nau_sua", "colors": ["Nau_Dat_Cafe", "Trang_Kem_Be"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    133: {"name": "hoa_nhi_tim_cuc_dai_pastel", "colors": ["Tim_Lavender"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    134: {"name": "caro_xanh_cun_gau_be", "colors": ["Xanh_Duong_Pastel", "Xam_Ghi_Den"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    135: {"name": "cham_bi_trang_nau_socola_2", "colors": ["Nau_Dat_Cafe"], "patterns": ["Trai_Tim_No"], "tones": ["Am_Ap_Earthy", "Vintage_Retro_Co_Dien"]},
    136: {"name": "gau_nau_hoa_nhi_kem_sua", "colors": ["Trang_Kem_Be", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat", "Hoa_Nhi_Hoa_Co"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    137: {"name": "tho_gau_ke_soc_tho_cam_pastel", "colors": ["Trang_Kem_Be", "Xanh_Duong_Pastel", "Hong_Do_Dao"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    138: {"name": "ke_soc_vang_khi_con_chuoi_2", "colors": ["Vang_Cam"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    139: {"name": "ke_soc_xanh_da_troi_ngua_go", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Soc", "Hoat_Hinh_Tre_Em"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    140: {"name": "cun_cung_cun_dom_den_trang", "colors": ["Trang_Kem_Be", "Xam_Ghi_Den"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    141: {"name": "no_den_cham_bi_xanh_xam", "colors": ["Xanh_Duong_Pastel", "Xam_Ghi_Den"], "patterns": ["Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Hien_Dai_Toi_Gian"]},
    142: {"name": "ke_soc_xanh_reu_gau_meo", "colors": ["Xanh_La_Mint", "Trang_Kem_Be"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy", "Han_Quoc_Cute_Dang_Yeu"]},
    143: {"name": "ke_soc_nau_cun_con_2", "colors": ["Nau_Dat_Cafe"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Am_Ap_Earthy"]},
    144: {"name": "gau_cookie_nau_vang_bo", "colors": ["Vang_Cam", "Nau_Dat_Cafe"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Am_Ap_Earthy"]},
    145: {"name": "tho_trang_gau_con_xanh_pastel", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    146: {"name": "ke_soc_vang_cam_gau_cun", "colors": ["Vang_Cam"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    147: {"name": "gau_bong_trang_tuyet_xanh_nhạt", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    148: {"name": "caro_xanh_da_troi_cun_gau", "colors": ["Xanh_Duong_Pastel"], "patterns": ["Ke_Caro", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    149: {"name": "hoa_hong_vintage_hong_dat", "colors": ["Hong_Do_Dao"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    150: {"name": "ke_soc_cau_vong_xanh_vang_gau", "colors": ["Xanh_La_Mint", "Vang_Cam", "Xanh_Duong_Pastel"], "patterns": ["Ke_Soc", "Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu"]},
    151: {"name": "hoa_cuc_dai_nau_be_co_dien", "colors": ["Nau_Dat_Cafe", "Trang_Kem_Be"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    152: {"name": "trai_tim_den_nho_trang_kem", "colors": ["Trang_Kem_Be", "Xam_Ghi_Den"], "patterns": ["Trai_Tim_No"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Hien_Dai_Toi_Gian"]},
    153: {"name": "hoa_nhi_tim_lavender_nhạt", "colors": ["Tim_Lavender"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Han_Quoc_Cute_Dang_Yeu"]},
    154: {"name": "hoa_cuc_dai_nau_dat_vintage", "colors": ["Nau_Dat_Cafe"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    155: {"name": "cham_bi_trang_do_man_do_do", "colors": ["Hong_Do_Dao"], "patterns": ["Trai_Tim_No"], "tones": ["Vintage_Retro_Co_Dien", "Am_Ap_Earthy"]},
    156: {"name": "hoa_hong_vintage_hong_dat_2", "colors": ["Hong_Do_Dao"], "patterns": ["Hoa_Nhi_Hoa_Co"], "tones": ["Vintage_Retro_Co_Dien"]},
    157: {"name": "meo_cun_den_trang_xam_nhat", "colors": ["Xam_Ghi_Den", "Trang_Kem_Be"], "patterns": ["Gau_Dong_Vat"], "tones": ["Han_Quoc_Cute_Dang_Yeu", "Hien_Dai_Toi_Gian"]},
}

# Create Master Pool of Renamed Files
pool_dir = os.path.join(dest_root, '_Tat_Ca_Anh_Goc_Da_Doi_Ten')
os.makedirs(pool_dir, exist_ok=True)

manifest = []

for idx, p in enumerate(unique_files, 1):
    tag = TAGS[idx]
    std_filename = f"{idx:03d}_{tag['name']}.jpg"
    std_path = os.path.join(pool_dir, std_filename)
    shutil.copy2(p, std_path)

    # Distribute into 01_Theo_Mau_Sac
    for color in tag["colors"]:
        fld = os.path.join(dest_root, "01_Theo_Mau_Sac", color)
        os.makedirs(fld, exist_ok=True)
        shutil.copy2(p, os.path.join(fld, std_filename))

    # Distribute into 02_Theo_Hoa_Tiet
    for pattern in tag["patterns"]:
        fld = os.path.join(dest_root, "02_Theo_Hoa_Tiet", pattern)
        os.makedirs(fld, exist_ok=True)
        shutil.copy2(p, os.path.join(fld, std_filename))

    # Distribute into 03_Theo_Tone_Phong_Cach
    for tone in tag["tones"]:
        fld = os.path.join(dest_root, "03_Theo_Tone_Phong_Cach", tone)
        os.makedirs(fld, exist_ok=True)
        shutil.copy2(p, os.path.join(fld, std_filename))

    manifest.append({
        "id": idx,
        "name": tag["name"],
        "filename": std_filename,
        "path": f"_Tat_Ca_Anh_Goc_Da_Doi_Ten/{std_filename}",
        "colors": tag["colors"],
        "patterns": tag["patterns"],
        "tones": tag["tones"],
    })

print(f"Distributed {len(manifest)} unique images into multi-categories successfully!")

# Generate HTML Gallery
manifest_json = json.dumps(manifest, ensure_ascii=False)

html_code = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bộ Sưu Tập Set 165k — Phân Loại Chi Tiết</title>
  <style>
    :root {{
      --bg: #fcfbf9;
      --card-bg: #ffffff;
      --text: #2a2421;
      --text-muted: #7c726a;
      --primary: #8a5a36;
      --primary-light: #f5ede6;
      --border: #e9e3da;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 24px 20px 80px;
    }}
    header {{
      max-width: 1400px;
      margin: 0 auto 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }}
    h1 {{
      font-size: 26px;
      color: var(--primary);
      margin-bottom: 6px;
    }}
    .subtitle {{
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 16px;
    }}
    .filter-section {{
      margin-bottom: 12px;
    }}
    .filter-label {{
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }}
    .chip-container {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }}
    .chip {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 5px 12px;
      border-radius: 16px;
      font-size: 13px;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;
    }}
    .chip:hover {{
      border-color: var(--primary);
      color: var(--primary);
    }}
    .chip.active {{
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }}
    .counter {{
      font-size: 13px;
      color: var(--text-muted);
      margin: 16px 0 20px;
    }}
    .grid {{
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }}
    .card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      display: flex;
      flex-direction: column;
    }}
    .card:hover {{
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.06);
    }}
    .img-wrap {{
      width: 100%;
      aspect-ratio: 1;
      background: #eee;
      overflow: hidden;
    }}
    .img-wrap img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .card-body {{
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}
    .card-title {{
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .tags {{
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }}
    .tag {{
      background: var(--primary-light);
      color: var(--primary);
      font-size: 10px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
    }}

    .lightbox {{
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(18, 14, 12, 0.9);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }}
    .lightbox.active {{ display: flex; }}
    .lb-img {{
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 6px;
      object-fit: contain;
    }}
  </style>
</head>
<body>
  <header>
    <h1>Bộ Sưu Tập Set 165k — Phân Loại Chi Tiết</h1>
    <p class="subtitle">Đã xóa sạch ảnh trùng lặp. Phân loại toàn bộ 157 sản phẩm theo Màu sắc, Họa tiết và Tone phong cách.</p>

    <div class="filter-section">
      <div class="filter-label">🎨 Màu Sắc</div>
      <div class="chip-container" id="color-chips"></div>
    </div>

    <div class="filter-section">
      <div class="filter-label">✨ Họa Tiết</div>
      <div class="chip-container" id="pattern-chips"></div>
    </div>

    <div class="filter-section">
      <div class="filter-label">🌿 Tone / Phong Cách</div>
      <div class="chip-container" id="tone-chips"></div>
    </div>

    <div class="counter" id="counter"></div>
  </header>

  <div class="grid" id="grid"></div>

  <div class="lightbox" id="lightbox" onclick="closeLightbox(event)">
    <img id="lb-img" class="lb-img" src="" alt="preview">
  </div>

  <script>
    const data = {manifest_json};

    let selectedColor = 'ALL';
    let selectedPattern = 'ALL';
    let selectedTone = 'ALL';

    const colors = ['ALL', 'Trang_Kem_Be', 'Hong_Do_Dao', 'Xanh_Duong_Pastel', 'Xanh_La_Mint', 'Vang_Cam', 'Tim_Lavender', 'Xam_Ghi_Den', 'Nau_Dat_Cafe'];
    const patterns = ['ALL', 'Ke_Caro', 'Ke_Soc', 'Hoa_Nhi_Hoa_Co', 'Gau_Dong_Vat', 'Trai_Tim_No', 'Hoat_Hinh_Tre_Em', 'Hinh_Hoc_Truu_Tuong', 'Tron_Toi_Gian'];
    const tones = ['ALL', 'Han_Quoc_Cute_Dang_Yeu', 'Vintage_Retro_Co_Dien', 'Hien_Dai_Toi_Gian', 'Am_Ap_Earthy'];

    const formatName = (str) => {{
      if (str === 'ALL') return 'Tất cả';
      return str.replace(/_/g, ' ');
    }};

    function buildChips(containerId, list, currentVal, onSelect) {{
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      list.forEach(val => {{
        const btn = document.createElement('div');
        btn.className = 'chip' + (val === currentVal ? ' active' : '');
        btn.textContent = formatName(val);
        btn.onclick = () => onSelect(val);
        container.appendChild(btn);
      }});
    }}

    function renderFilters() {{
      buildChips('color-chips', colors, selectedColor, v => {{ selectedColor = v; render(); }});
      buildChips('pattern-chips', patterns, selectedPattern, v => {{ selectedPattern = v; render(); }});
      buildChips('tone-chips', tones, selectedTone, v => {{ selectedTone = v; render(); }});
    }}

    function render() {{
      renderFilters();
      const grid = document.getElementById('grid');
      grid.innerHTML = '';

      const filtered = data.filter(item => {{
        if (selectedColor !== 'ALL' && !item.colors.includes(selectedColor)) return false;
        if (selectedPattern !== 'ALL' && !item.patterns.includes(selectedPattern)) return false;
        if (selectedTone !== 'ALL' && !item.tones.includes(selectedTone)) return false;
        return true;
      }});

      document.getElementById('counter').textContent = `Hiển thị ${{filtered.length}} / ${{data.length}} sản phẩm`;

      filtered.forEach(item => {{
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openLightbox(item.path);

        const tagsHtml = [
          ...item.colors.map(c => `<span class="tag">${{c.replace(/_/g, ' ')}}</span>`),
          ...item.patterns.map(p => `<span class="tag">${{p.replace(/_/g, ' ')}}</span>`),
          ...item.tones.map(t => `<span class="tag">${{t.replace(/_/g, ' ')}}</span>`)
        ].join('');

        card.innerHTML = `
          <div class="img-wrap">
            <img src="${{item.path}}" alt="${{item.name}}" loading="lazy" />
          </div>
          <div class="card-body">
            <div class="card-title">#${{item.id}} - ${{item.name.replace(/_/g, ' ')}}</div>
            <div class="tags">${{tagsHtml}}</div>
          </div>
        `;
        grid.appendChild(card);
      }});
    }}

    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    function openLightbox(src) {{
      lbImg.src = src;
      lb.classList.add('active');
    }}
    function closeLightbox(e) {{
      if (!e || e.target !== lbImg) lb.classList.remove('active');
    }}
    window.addEventListener('keydown', e => {{ if (e.key === 'Escape') closeLightbox(); }});

    render();
  </script>
</body>
</html>
"""

with open(os.path.join(dest_root, "gallery_chi_tiet.html"), "w", encoding="utf-8") as f:
    f.write(html_code)

print("HTML Gallery generated at:", os.path.join(dest_root, "gallery_chi_tiet.html"))
