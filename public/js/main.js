// ==================== 页面加载完成后执行 ====================
$(document).ready(function() {
    // 初始化表单验证
    initFormValidation();
    
    // 初始化搜索功能
    initSearch();
    
    // 初始化其他交互功能
    initInteractions();
});

// ==================== 表单验证 ====================
function initFormValidation() {
    // 注册表单验证
    $('#registerForm').on('submit', function(e) {
        if (!validateRegisterForm()) {
            e.preventDefault();
            return false;
        }
    });
    
    // 登录表单验证
    $('#loginForm').on('submit', function(e) {
        if (!validateLoginForm()) {
            e.preventDefault();
            return false;
        }
    });
    
    // 个人中心表单验证
    $('#profileForm').on('submit', function(e) {
        if (!validateProfileForm()) {
            e.preventDefault();
            return false;
        }
    });
    
    // 实时验证
    $('#registerForm #username').on('blur', validateUsername);
    $('#registerForm #email').on('blur', validateEmail);
    $('#registerForm #password').on('blur', validatePassword);
    $('#registerForm #confirmPassword').on('blur', validateConfirmPassword);
    
    $('#profileForm #email').on('blur', validateEmail);
    $('#profileForm #newPassword').on('blur', function() {
        if ($(this).val()) {
            validatePassword.call(this);
        }
    });
    $('#profileForm #confirmPassword').on('blur', function() {
        if ($(this).val()) {
            validateConfirmPassword.call(this);
        }
    });
}

// 验证用户名
function validateUsername() {
    const username = $(this).val();
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const $error = $('#usernameError');
    
    if (!username) {
        $(this).addClass('is-invalid');
        $error.text('请输入用户名');
        return false;
    } else if (!usernameRegex.test(username)) {
        $(this).addClass('is-invalid');
        $error.text('用户名必须是3-20个字符，只能包含字母、数字和下划线');
        return false;
    } else {
        $(this).removeClass('is-invalid');
        $error.text('');
        return true;
    }
}

// 验证邮箱
function validateEmail() {
    const email = $(this).val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const $error = $('#emailError');
    
    if (!email) {
        $(this).addClass('is-invalid');
        $error.text('请输入邮箱地址');
        return false;
    } else if (!emailRegex.test(email)) {
        $(this).addClass('is-invalid');
        $error.text('请输入有效的邮箱地址');
        return false;
    } else {
        $(this).removeClass('is-invalid');
        $error.text('');
        return true;
    }
}

// 验证密码
function validatePassword() {
    const password = $(this).val();
    const $error = $('#passwordError, #newPasswordError');
    
    if (!password) {
        $(this).addClass('is-invalid');
        $error.text('请输入密码');
        return false;
    } else if (password.length < 6) {
        $(this).addClass('is-invalid');
        $error.text('密码长度至少为6个字符');
        return false;
    } else {
        $(this).removeClass('is-invalid');
        $error.text('');
        return true;
    }
}

// 验证确认密码
function validateConfirmPassword() {
    const confirmPassword = $(this).val();
    const password = $('#password').val() || $('#newPassword').val();
    const $error = $('#confirmPasswordError');
    
    if (!confirmPassword) {
        $(this).addClass('is-invalid');
        $error.text('请确认密码');
        return false;
    } else if (confirmPassword !== password) {
        $(this).addClass('is-invalid');
        $error.text('两次输入的密码不一致');
        return false;
    } else {
        $(this).removeClass('is-invalid');
        $error.text('');
        return true;
    }
}

// 验证注册表单
function validateRegisterForm() {
    let isValid = true;
    
    isValid = validateField('#registerForm #username', validateUsername) && isValid;
    isValid = validateField('#registerForm #email', validateEmail) && isValid;
    isValid = validateField('#registerForm #password', validatePassword) && isValid;
    isValid = validateField('#registerForm #confirmPassword', validateConfirmPassword) && isValid;
    
    return isValid;
}

// 验证登录表单
function validateLoginForm() {
    const username = $('#loginForm #username').val();
    const password = $('#loginForm #password').val();
    
    if (!username) {
        $('#loginForm #username').addClass('is-invalid');
        $('#usernameError').text('请输入用户名');
        return false;
    }
    
    if (!password) {
        $('#loginForm #password').addClass('is-invalid');
        $('#passwordError').text('请输入密码');
        return false;
    }
    
    return true;
}

// 验证个人中心表单
function validateProfileForm() {
    let isValid = true;
    
    isValid = validateField('#profileForm #email', validateEmail) && isValid;
    
    const oldPassword = $('#profileForm #oldPassword').val();
    const newPassword = $('#profileForm #newPassword').val();
    const confirmPassword = $('#profileForm #confirmPassword').val();
    
    // 如果填写了密码相关字段，则必须全部填写
    if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword) {
            $('#profileForm #oldPassword').addClass('is-invalid');
            isValid = false;
        }
        if (!newPassword) {
            $('#profileForm #newPassword').addClass('is-invalid');
            $('#newPasswordError').text('请输入新密码');
            isValid = false;
        }
        if (!confirmPassword) {
            $('#profileForm #confirmPassword').addClass('is-invalid');
            $('#confirmPasswordError').text('请确认新密码');
            isValid = false;
        }
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            $('#profileForm #confirmPassword').addClass('is-invalid');
            $('#confirmPasswordError').text('两次输入的新密码不一致');
            isValid = false;
        }
    }
    
    return isValid;
}

// 验证单个字段
function validateField(selector, validator) {
    const $field = $(selector);
    if ($field.length) {
        return validator.call($field[0]);
    }
    return true;
}

// ==================== 搜索功能 ====================
function initSearch() {
    // 搜索表单提交
    $('.search-form').on('submit', function(e) {
        const keyword = $('#searchInput').val().trim();
        if (!keyword) {
            e.preventDefault();
            alert('请输入搜索关键词');
            return false;
        }
    });
    
    // AJAX搜索建议（可选功能）
    let searchTimeout;
    $('#searchInput').on('input', function() {
        clearTimeout(searchTimeout);
        const keyword = $(this).val().trim();
        
        if (keyword.length >= 2) {
            searchTimeout = setTimeout(function() {
                // 这里可以添加AJAX搜索建议功能
                // performAjaxSearch(keyword);
            }, 300);
        }
    });
}

// ==================== AJAX功能 ====================
function performAjaxSearch(keyword) {
    $.ajax({
        url: '/api/movies/search',
        method: 'GET',
        data: { q: keyword },
        dataType: 'json',
        success: function(data) {
            // 处理搜索结果
            console.log('搜索结果:', data);
        },
        error: function(xhr, status, error) {
            console.error('搜索错误:', error);
        }
    });
}

// ==================== 其他交互功能 ====================
function initInteractions() {
    // 高级筛选开关
    $('.filter-toggle').on('click', function() {
        $('.advanced-filters').toggleClass('d-none');
    });

    // 平滑滚动
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 70
            }, 500);
        }
    });
    
    // 电影卡片悬停效果增强
    $('.movie-card, .movie-card-small').hover(
        function() {
            $(this).find('.movie-title, .movie-title-small').css('color', 'var(--primary-color)');
        },
        function() {
            $(this).find('.movie-title, .movie-title-small').css('color', 'var(--dark-color)');
        }
    );
    
    // 表单输入焦点效果
    $('.form-control').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });
    
    // 自动隐藏提示信息
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);

    // 轮播与推荐卡片联动：点击推荐卡跳转轮播并保持自动播放（带防护检查）
    (function() {
        // 仅在页面包含轮播且 bootstrap 可用时执行
        var carouselEl = document.getElementById('movieCarousel');
        if (!carouselEl) return;
        if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Carousel) return;

        // 获取或创建 Bootstrap Carousel 实例（使用页面上配置的 interval）
        var carousel;
        try {
            carousel = window.bootstrap.Carousel.getOrCreateInstance(carouselEl);
        } catch (err) {
            console.warn('Carousel instance 创建失败:', err);
            return;
        }

        // 使用事件委托绑定，避免在没有推荐卡的页面发生错误
        $(document).on('click', '.recommendation-item', function(e) {
            // 如果点击的是播放按钮（内部的链接），允许默认行为跳转详情页
            if ($(e.target).closest('.play-btn-overlay').length) {
                return; // 让链接正常跳转
            }
            // 如果页面上没有轮播直接返回
            if (!carouselEl) return;
            e.preventDefault();
            var targetId = $(this).data('movie-id');
            if (!targetId) return;

            // 在 carousel-inner 中查找匹配的 slide 的索引
            var $slides = $('#movieCarousel .carousel-inner .carousel-item');
            if (!$slides.length) return;
            var targetIndex = -1;
            $slides.each(function(i) {
                if ($(this).data('movie-id') == targetId) {
                    targetIndex = i;
                    return false;
                }
            });

            if (targetIndex >= 0) {
                try {
                    if (typeof carousel.to === 'function') carousel.to(targetIndex);
                    if (typeof carousel.cycle === 'function') carousel.cycle();
                } catch (err) {
                    console.error('切换到轮播 slide 失败:', err);
                }
            }
        });
    })();

    // 筛选 Chip 行为：点击 chip 更新隐藏字段并提交表单
    $(document).on('click', '.filter-chip', function(e){
        var $btn = $(this);
        var name = $btn.data('name');
        var value = $btn.data('value');
        if (!name) return;

        // 更新隐藏输入
        var $input = $('#filter-' + name);
        if ($input.length) {
            $input.val(value);
        }

        // 切换 active 状态（只在当前行）
        $btn.closest('.filter-chips').find('.filter-chip').removeClass('active');
        $btn.addClass('active');

        // 提交表单
        var $form = $('#filtersForm');
        if ($form.length) {
            $form.trigger('submit');
        }
    });
}

// ==================== 工具函数 ====================
// 显示加载动画
function showLoading() {
    $('body').append('<div id="loadingOverlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;"><div class="spinner-border text-light" role="status"><span class="visually-hidden">加载中...</span></div></div>');
}

// 隐藏加载动画
function hideLoading() {
    $('#loadingOverlay').remove();
}

// 显示提示消息
function showMessage(message, type = 'info') {
    const alertClass = type === 'error' ? 'alert-danger' : type === 'success' ? 'alert-success' : 'alert-info';
    const alertHtml = `<div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    
    $('main').prepend(alertHtml);
    
    setTimeout(function() {
        $('.alert').fadeOut('slow', function() {
            $(this).remove();
        });
    }, 3000);
}

