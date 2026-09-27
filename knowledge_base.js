/**
 * knowledge_base.js
 * 艦娘や装備に対するWikiベースの戦術・運用知識（特効、シナジー、過積載など）を提供するナレッジベース。
 * 各艦娘の実ステータスに基づいた詳細な運用助言を生成する。
 */

const TacticalKnowledge = {
    getShipAdvice: function(ship, master) {
        const advice = [];
        const name = ship.name || "";
        const stype = String(master.type_name || master.stype_name || "");
        const is = (keyword) => stype.includes(keyword); // 部分一致ヘルパー
        const lv = ship.lv || 1;
        const luck = ship.luck || master.luck || 0;
        const fire = master.fire || 0;
        const torp = master.torp || 0;
        const aa = master.aa || 0;
        const asw = master.asw || 0;
        const armor = master.armor || 0;
        const evasion = master.evasion || 0;
        const slots = master.slot_cap || master.slots || master.maxeq || [];

        // ==========================================
        // 1. 固有艦の特殊能力・運用法（特にユニークスキル持ち）
        // ==========================================
        if (name.includes('長門改二') || name.includes('陸奥改二')) {
            advice.push("<strong class='text-red-400'>【特殊砲撃】</strong> 梯形陣（または第二陣形）で発動する特殊砲撃（胸熱砲）が超強力です。イベント最深部の切り札。");
            advice.push("<strong class='text-green-400'>【シナジー】</strong> 徹甲弾や水上電探を装備することで、特殊砲撃の威力がさらに倍率ドン！されます。");
        }
        else if (name.includes('大和改二') || name.includes('武蔵改二')) {
            advice.push("<strong class='text-red-400'>【最強の矛と盾】</strong> 燃費は極めて重いですが、装甲・火力ともにゲーム内最強クラスです。");
            if (name.includes('大和改二')) advice.push("<strong class='text-red-400'>【特殊砲撃】</strong> 僚艦に特定の戦艦を置くことで発動する3隻攻撃が非常に強力です。");
        }
        else if (name.includes('Nelson')) {
            advice.push("<strong class='text-red-400'>【特殊砲撃(Nelson Touch)】</strong> 複縦陣で旗艦配置時、1・3・5番艦の3隻で一斉攻撃します。道中の硬い敵をまとめて倒すのに最適。");
        }
        else if (name.includes('Colorado') || name.includes('Maryland')) {
            advice.push("<strong class='text-red-400'>【特殊砲撃(Big Seven)】</strong> 梯形陣で旗艦配置時、1・2・3番艦による特殊砲撃を発動。長門型と同系統の超火力攻撃です。");
        }
        else if (name.includes('金剛改二丙') || name.includes('比叡改二丙')) {
            advice.push("<strong class='text-red-400'>【僚艦夜戦突撃】</strong> 第二艦隊旗艦時、2番艦と連携して夜戦突撃を発動。夜戦火力がさらに跳ね上がる高速戦艦の切り札です。");
        }
        else if (name.includes('矢矧改二')) {
            advice.push("<strong class='text-yellow-400'>【万能・最強格軽巡】</strong> 甲標的による先制雷撃と、水爆/水戦による制空補助を両立できる現状最強クラスの軽巡洋艦です。");
        }
        else if (name.includes('Atlanta') || name.includes('アトランタ')) {
            advice.push("<strong class='text-green-400'>【最強防空】</strong> 専用の強力な対空カットインを持ち、敵の航空機を枯らす（無力化する）能力が全艦娘中ダントツです。");
            advice.push("<strong class='text-yellow-400'>【GFCS砲】</strong> 専用のGFCS Mk.37砲との組み合わせで固有対空CIが発動。汎用CIよりはるかに強力です。");
        }
        else if (name.includes('夕張改二特')) {
            advice.push("<strong class='text-blue-300'>【多スロット】</strong> 貴重な5スロ軽巡。甲標的・大発・電探などを積み分け、対地攻撃から先制雷撃まで何でもこなせます。");
        }
        else if (name.includes('阿武隈改二')) {
            advice.push("<strong class='text-blue-400'>【先制雷撃軽巡】</strong> 甲標的を装備可能な軽巡。水雷戦隊のルート制限を満たしつつ先制雷撃が可能で、多くの海域で活躍します。");
        }
        else if (name.includes('由良改二')) {
            advice.push("<strong class='text-green-400'>【水戦軽巡】</strong> 水上戦闘機を搭載可能。空母不可の海域で貴重な制空補助が可能な軽巡です。大発も積めるため対地にも対応。");
        }
        else if (name.includes('五十鈴改二')) {
            advice.push("<strong class='text-blue-300'>【無条件先制対潜】</strong> 対潜値の条件を満たさなくても無条件で先制対潜攻撃が可能。1-5や7-1等の対潜マップのエースです。");
            advice.push("<strong class='text-green-400'>【固有対空CI】</strong> 対空カットインも発動可能で、防空要員としても運用できます。");
        }
        else if (name.includes('龍田改二')) {
            advice.push("<strong class='text-blue-300'>【無条件先制対潜】</strong> 先制対潜＋大発搭載で対潜マップの戦果稼ぎ・レベリングに最適。遠征にも役立ちます。");
        }
        else if (name.includes('Jervis') || name.includes('Fletcher') || name.includes('Johnston') || name.includes('Samuel')) {
            advice.push("<strong class='text-blue-300'>【無条件先制対潜】</strong> 対潜値の条件を満たさなくても無条件で先制対潜攻撃が可能な貴重な駆逐艦です。");
        }
        else if (name.includes('秋月') || name.includes('照月') || name.includes('初月') || name.includes('涼月') || name.includes('冬月') || name.includes('春月')) {
            advice.push("<strong class='text-green-400'>【防空駆逐艦】</strong> 秋月型固有の強力な対空カットインを持ちます。敵航空攻撃からの被害を大幅に抑えるエース対空要員です。");
            advice.push("<strong class='text-yellow-400'>【注意点】</strong> 火力・雷装は低めなので水上戦でのダメージは控えめ。防空に特化した編成位置が重要です。");
        }
        else if (name.includes('北上改二') || name.includes('大井改二') || name.includes('木曾改二')) {
            advice.push("<strong class='text-blue-400'>【開幕雷撃】</strong> 甲標的による先制雷撃が超強力。ただしイベントでの出撃制限（ルート逸れ）に注意。");
            advice.push("<strong class='text-yellow-400'>【注意】</strong> 装甲・耐久が低いため大破しやすいです。道中支援やキラ付けで補いましょう。");
        }
        else if (name.includes('あきつ丸')) {
            advice.push("<strong class='text-orange-400'>【揚陸艦】</strong> 対潜哨戒にカ号観測機を搭載可能。また、艦載機を積んで制空要員としても運用できる特殊な艦です。");
        }
        else if (name.includes('明石')) {
            advice.push("<strong class='text-green-400'>【泊地修理】</strong> 旗艦に配置し2戦以上経過すると、損傷した味方を小破以下まで修理できる唯一の艦です。改修工廠でも必須。");
        }
        else if (name.includes('速吸') || name.includes('神威')) {
            advice.push("<strong class='text-green-400'>【洋上補給】</strong> 洋上補給を装備して使用すると、ボス戦前に味方の弾薬・燃料を回復させ、ダメージペナルティを軽減できます。");
        }

        // ==========================================
        // 2. ステータスに基づく汎用分析（固有判定に引っかからなかった艦用）
        // ==========================================

        // --- 夜戦カットイン適性（運が高い艦） ---
        if (luck >= 50) {
            advice.push(`<strong class='text-purple-400'>【夜戦カットイン適性◎】</strong> 運が${luck}と非常に高く、魚雷カットインの発動率が高いです。夜戦でボスにトドメを刺すフィニッシャー適性があります。`);
        } else if (luck >= 30 && (is('駆逐') || is('軽巡') || is('重巡'))) {
            advice.push(`<strong class='text-purple-300'>【夜戦カットイン可能】</strong> 運${luck}は中程度。まるゆによる運改修で+20程度上げると、安定したカットイン艦に化けます。`);
        } else if (luck < 20 && (is('駆逐') || is('軽巡') || is('重巡'))) {
            advice.push(`<strong class='text-gray-400'>【夜戦連撃推奨】</strong> 運${luck}は低めで魚雷CIは不安定。主砲×2の夜戦連撃装備で安定火力を出す運用が向いています。`);
        }

        // --- 対潜能力の評価 ---
        if (is('駆逐') || is('軽巡') || is('海防')) {
            const baseAsw = asw || 0;
            const lvAsw = Math.floor(baseAsw + lv * 0.5); // 概算の対潜値
            if (is('海防')) {
                advice.push("<strong class='text-blue-200'>【海防艦特性】</strong> 低レベルでも先制対潜が可能（ソナー装備で対潜60以上で発動）。近代化改修の対潜素材としても重要です。");
            } else if (lv >= 80 && lvAsw >= 80) {
                advice.push(`<strong class='text-blue-300'>【先制対潜】</strong> Lv${lv}の現在、ソナー＋爆雷で対潜値合計100を超えて先制対潜が可能な圏内です。1-5や7-1のエースになれます。`);
            } else if (lv >= 50 && is('駆逐')) {
                advice.push(`<strong class='text-blue-200'>【対潜育成中】</strong> 先制対潜にはもう少しレベルが必要です。Lv80〜99を目標に育成すると、ソナー装備で対潜100を超えやすくなります。`);
            }
        }

        // --- 対空能力の評価 ---
        if (aa >= 80) {
            advice.push(`<strong class='text-green-400'>【高対空値】</strong> 素の対空値が${aa}と高く、対空カットイン装備との相性が良好です。防空要員として信頼できます。`);
        } else if (aa >= 60 && (is('駆逐') || is('軽巡'))) {
            advice.push(`<strong class='text-green-300'>【対空カットイン候補】</strong> 対空${aa}は水雷戦隊の中では高めです。高角砲＋対空電探で汎用対空CIを発動できます。`);
        }

        // --- 火力評価（戦艦・重巡系） ---
        if (is('戦艦') || is('航戦')) {
            if (fire >= 100) {
                advice.push(`<strong class='text-red-400'>【超火力】</strong> 素火力${fire}はトップクラス。徹甲弾＋主砲×2＋偵察機の弾着観測射撃でボスに致命打を与えられます。`);
            } else if (fire >= 80) {
                advice.push(`<strong class='text-yellow-400'>【高火力戦艦】</strong> 素火力${fire}は優秀。フィットする主砲を選んで命中率を確保しつつ、弾着観測射撃を狙いましょう。`);
            }
            if (is('航戦') || is('航空戦艦')) {
                advice.push("<strong class='text-green-400'>【制空補助】</strong> 水上戦闘機（水戦）や瑞雲を装備でき、空母が出せない海域で制空権を確保する重要な役割を担います。");
            }
        }

        // --- 重巡洋艦 ---
        if (is('重巡') || is('航巡')) {
            if (is('航巡')) {
                advice.push("<strong class='text-green-400'>【制空補助＆対地】</strong> 水戦で制空補助、大発・内火艇で対地攻撃と多彩な役割をこなせます。空母出撃不可の海域で特に重宝。");
            } else {
                advice.push("<strong class='text-yellow-400'>【夜戦連撃】</strong> 主砲×2＋偵察機＋電探（または夜偵）で昼の弾着連撃と夜の連撃を両立させるのが基本装備です。");
                if (fire >= 70) {
                    advice.push(`<strong class='text-red-300'>【高火力重巡】</strong> 素火力${fire}は重巡の中でも高い部類。三式弾を持てば対地（集積地棲姫等）にも対応できます。`);
                }
            }
        }

        // --- 軽巡洋艦 ---
        if (is('軽巡') && advice.length === 0) {
            advice.push("<strong class='text-yellow-300'>【水雷戦隊の中核】</strong> ルート分岐で「軽巡1」を要求される海域が非常に多いです。駆逐艦との組み合わせで多くの海域を攻略できます。");
            if (torp >= 70) {
                advice.push(`<strong class='text-blue-300'>【高雷装軽巡】</strong> 雷装${torp}は高く、夜戦での魚雷CIや連撃ダメージに期待できます。`);
            }
        }

        // --- 駆逐艦（汎用） ---
        if (is('駆逐') && advice.length <= 1) {
            if (fire >= 55 || torp >= 85) {
                advice.push(`<strong class='text-red-300'>【高火力駆逐】</strong> 火力${fire}/雷装${torp}は駆逐艦の中でも高水準。夜戦での決定力に期待できるアタッカーです。`);
            } else if (evasion >= 80) {
                advice.push("<strong class='text-cyan-300'>【高回避】</strong> 回避値が高く、道中の被弾率が低い安定型です。キラ付けと合わせて道中大破率を大幅に抑えられます。");
            } else {
                advice.push("<strong class='text-gray-300'>【汎用駆逐艦】</strong> ルート分岐で駆逐3〜4隻を要求される海域が多いため、数を揃えて育てておくことが重要です。");
            }
        }

        // --- 空母系 ---
        if (is('正規空母') || is('装甲空母') || is('軽空母') || is('空母')) {
            if (is('装甲空母') || name.includes('装甲空母') || name.includes('大鳳') || name.includes('Saratoga Mk.II')) {
                advice.push("<strong class='text-red-300'>【装甲空母】</strong> 中破しても攻撃を継続できる特殊な空母です。イベント最深部のボス戦で最後まで攻撃し続けてくれる頼もしい存在。");
            } else if (is('軽空母')) {
                advice.push("<strong class='text-green-300'>【軽空母】</strong> 正規空母より燃費が軽く、ルート制限が緩い海域で活躍。対潜攻撃も可能な艦が多く、ソナー＋艦攻で先制対潜もできます。");
            } else {
                advice.push("<strong class='text-red-300'>【制空の主力】</strong> 艦戦で制空権を確保し、艦攻・艦爆で開幕航空攻撃と砲撃戦の両方でダメージを出す攻守の要です。");
            }
            if (Array.isArray(slots) && slots.some(s => s >= 30)) {
                const maxSlot = Math.max(...slots);
                advice.push(`<strong class='text-yellow-400'>【大スロット(${maxSlot}機)】</strong> 搭載数が多いスロットがあり、艦載機の撃墜に強いです。熟練度の維持がしやすく安定した運用ができます。`);
            }
        }

        // --- 潜水艦系 ---
        if (is('潜水艦') || is('潜水空母') || is('潜水')) {
            advice.push("<strong class='text-gray-400'>【デコイ運用】</strong> 敵の駆逐艦・軽巡洋艦の攻撃を吸い寄せ、主力艦を守ります（対潜攻撃のターゲットになる）。");
            if (is('潜水空母')) {
                advice.push("<strong class='text-green-300'>【水上機搭載可】</strong> 瑞雲等を搭載でき、制空補助が可能。潜水艦隊でも航空優勢を取れる貴重な存在です。");
            }
            if (lv >= 50) {
                advice.push(`<strong class='text-blue-300'>【開幕雷撃】</strong> Lv${lv}なら開幕雷撃の火力も十分。後期型魚雷を搭載すると更にダメージが伸びます。`);
            }
        }

        // --- 雷巡 ---
        if (is('雷巡')) {
            advice.push("<strong class='text-blue-400'>【開幕雷撃】</strong> 「甲標的」を装備させることで戦闘開始時に先制雷撃を行います。極めて強力ですが、イベントではルート逸れのペナルティを受けることが多いです。");
            advice.push("<strong class='text-yellow-400'>【注意】</strong> 装甲・耐久が低く大破しやすいです。キラ付けや道中支援の活用が必須。");
        }

        // --- 水上機母艦 ---
        if (is('水母') || is('水上機母艦')) {
            advice.push("<strong class='text-green-300'>【水上機母艦】</strong> 甲標的で先制雷撃＋水戦で制空補助が可能。ルート分岐で「水母1」を要求される海域も多く、育てておく価値が高いです。");
            advice.push("<strong class='text-orange-300'>【対地装備可】</strong> 大発動艇や内火艇を搭載可能で、対地戦にも参加できます。");
        }

        // ==========================================
        // 3. レベルに基づく汎用アドバイス
        // ==========================================
        if (lv >= 99) {
            advice.push(`<strong class='text-yellow-300'>【ケッコン済み】</strong> Lv${lv}。ステータスが上限を超えて成長しています。耐久+4、運+3〜6の隠しボーナスが適用されています。`);
        } else if (lv >= 90) {
            advice.push(`<strong class='text-yellow-200'>【高練度】</strong> Lv${lv}。命中・回避のレベル補正が大きく、ステータス以上の安定感があります。`);
        } else if (lv < 30 && !is('海防')) {
            advice.push(`<strong class='text-gray-400'>【育成推奨】</strong> Lv${lv}はまだ低いです。演習や1-5・7-1等で育成してLv50以上を目指しましょう。改造可能レベルに達しているかも確認を。`);
        }

        // ==========================================
        // 4. 最終フォールバック（それでも空の場合のみ）
        // ==========================================
        if (advice.length === 0) {
            advice.push("【標準運用】 バランスの取れたステータスです。史実海域でのイベント特効（ダメージボーナス）に期待して育成・温存しておくと活躍の場が広がります。");
        }

        return advice;
    },

    getItemAdvice: function(item, master) {
        const advice = [];
        const name = item.name || "";
        const type = String(master.typeName || master.type_name || "");
        const level = item.level || 0;

        // --- 主砲系 ---
        if (name.includes('徹甲弾')) {
            advice.push("<strong class='text-red-400'>【弾着観測射撃・徹甲弾補正】</strong> 戦艦に「主砲×2＋水上偵察機＋徹甲弾」と装備することで、昼戦での連撃やカットインが発動し、重装甲の敵を撃ち抜けます。");
            if (level >= 4) advice.push(`<strong class='text-yellow-300'>【改修★${level}】</strong> 改修による火力・命中ボーナスが反映されています。★6以上で効果が顕著になります。`);
        }
        else if (type === '大口径主砲' || type.includes('大口径')) {
            advice.push("<strong class='text-yellow-400'>【フィット補正】</strong> 戦艦ごとに「合う主砲」と「重すぎる主砲」があります。金剛型に46cm砲は過積載（命中ペナルティ）、長門型には41cm砲がフィットします。");
            if (level >= 1) advice.push(`<strong class='text-green-300'>【改修★${level}】</strong> 主砲の改修は火力+√(★)の隠しボーナスがあります。★9→★maxでは更に火力ジャンプがあるものも。`);
        }
        else if (type === '中口径主砲' || type.includes('中口径')) {
            advice.push("<strong class='text-yellow-300'>【軽巡・重巡向け】</strong> 重巡には20.3cm系がフィット（命中UP）。軽巡には15.5cm三連装砲や14cm連装砲がフィットします。");
            if (level >= 1) advice.push(`<strong class='text-green-300'>【改修★${level}】</strong> 改修による命中・火力ボーナスが加算されています。`);
        }
        else if (type === '小口径主砲' || type.includes('小口径')) {
            advice.push("<strong class='text-yellow-300'>【駆逐艦向け】</strong> 駆逐艦に2つ装備して夜戦連撃を確保するのが基本です。12.7cm系は改修すると火力が大きく伸びます。");
            if (name.includes('秋月砲') || name.includes('12.7cm連装砲A型改') || name.includes('12.7cm連装砲B型改')) {
                advice.push("<strong class='text-green-400'>【優秀装備】</strong> 駆逐艦のメイン火力として非常に優秀。改修優先度が高い装備です。");
            }
        }

        // --- 魚雷系 ---
        else if (type === '魚雷' || type.includes('魚雷')) {
            advice.push("<strong class='text-purple-400'>【夜戦カットイン】</strong> 魚雷を2〜3本搭載すると夜戦で魚雷カットイン攻撃が発動。運が高い艦娘との組み合わせで絶大な威力を発揮します。");
            if (name.includes('五連装') || name.includes('六連装') || name.includes('61cm五連装')) {
                advice.push("<strong class='text-red-300'>【高威力魚雷】</strong> 雷装値が高く、夜戦カットインの最大ダメージを大きく引き上げます。");
            }
            if (level >= 1) advice.push(`<strong class='text-green-300'>【改修★${level}】</strong> 魚雷の改修は雷装+√(★)ボーナス。夜戦カットインの威力を直接底上げします。`);
        }

        // --- 対潜装備系 ---
        else if (name.includes('探信儀') || name.includes('ソナー') || name.includes('ASDIC') || name.includes('HF/DF')) {
            advice.push("<strong class='text-blue-300'>【対潜シナジー】</strong> ソナーは「爆雷投射機」とセットで装備することで対潜火力に×1.15倍のボーナスが発生します。");
            advice.push("<strong class='text-blue-200'>【先制対潜の鍵】</strong> 先制対潜攻撃の発動条件（対潜値100以上）を満たすための最重要装備です。");
            if (level >= 1) advice.push(`<strong class='text-green-300'>【改修★${level}】</strong> ソナーの改修は対潜+√(★)ボーナス。先制対潜の条件達成が楽になります。`);
        }
        else if (name.includes('爆雷投射機') || name.includes('対潜迫撃')) {
            advice.push("<strong class='text-blue-300'>【対潜シナジー】</strong> 「ソナー」とセットで×1.15倍。さらに「爆雷」も積んで3点セット（ソナー＋投射機＋爆雷）にすると×1.43倍の強力なボーナスになります。");
        }
        else if (name.includes('爆雷') && !name.includes('投射機') && !name.includes('迫撃')) {
            advice.push("<strong class='text-blue-200'>【3点シナジーの要】</strong> ソナー＋爆雷投射機＋爆雷の3点セットで対潜火力×1.43倍。1-5や7-1でS勝利を安定させるための重要装備です。");
        }

        // --- 高角砲・対空系 ---
        else if (name.includes('高角砲')) {
            advice.push("<strong class='text-green-400'>【対空カットイン】</strong> 対空電探と一緒に装備することで、敵の航空攻撃を軽減する対空カットインのトリガーになります。");
            if (name.includes('10cm') && name.includes('高射装置')) {
                advice.push("<strong class='text-yellow-400'>【秋月砲】</strong> 通称「秋月砲」。駆逐艦の主砲としても高性能で、火力と対空を両立できる最優秀装備の一つです。");
            }
        }
        else if (name.includes('機銃') || name.includes('バルカン') || name.includes('Bofors')) {
            advice.push("<strong class='text-green-300'>【対空補強・特効機銃】</strong> 艦隊全体の加重対空値を底上げし、敵航空機の撃墜数を増やします。増設スロットに装備可能なものが多いです。");
            if (name.includes('集中配備')) {
                advice.push("<strong class='text-orange-300'>【特殊効果】</strong> 一部の集中配備機銃はPT小鬼群への命中率にボーナスがあり、イベントで重宝します。");
            }
        }

        // --- 偵察機系 ---
        else if (type === '水上偵察機' || type.includes('水上偵察')) {
            advice.push("<strong class='text-cyan-300'>【弾着観測射撃】</strong> 昼戦で連撃・カットインを発動させるために必須の装備です。索敵値（ルート分岐）にも大きく寄与します。");
            if (name.includes('夜偵') || name.includes('夜間')) {
                advice.push("<strong class='text-purple-300'>【夜戦触接】</strong> 夜戦開始時に発動し、味方全体の夜戦命中・火力にボーナスを与えます。夜戦重視の編成では最優先で装備したい逸品。");
            }
        }
        else if (type === '水上戦闘機' || name.includes('水戦') || name.includes('強風') || name.includes('二式水戦')) {
            advice.push("<strong class='text-green-400'>【制空補助】</strong> 航巡・水母・航戦に装備して制空権を確保。空母が出せない海域で制空優勢を取るために不可欠な装備です。");
            if (level >= 1) advice.push(`<strong class='text-green-300'>【改修★${level}】</strong> 水戦の改修は制空値に直接ボーナス。改修するほど制空ラインに余裕ができます。`);
        }

        // --- 艦載機系 ---
        else if (type === '艦上戦闘機' || type.includes('艦戦')) {
            advice.push("<strong class='text-green-400'>【制空権】</strong> 艦隊の防空の要です。この装備の改修（★）を進めると、目に見えない制空値ボーナスが加算されます。");
            if (item.alv > 0) {
                advice.push(`<strong class='text-yellow-400'>【熟練度ボーナス】</strong> 現在の熟練度(>>${item.alv})により、制空値に強力なボーナスが加算されています。`);
            }
        }
        else if (type === '艦上攻撃機' || type.includes('艦攻')) {
            advice.push("<strong class='text-blue-300'>【開幕航空攻撃＋砲撃戦】</strong> 空母に搭載して開幕の航空攻撃と砲撃戦の両方でダメージを出します。搭載数が多いスロットに配置しましょう。");
            if (name.includes('流星') || name.includes('天山')) {
                advice.push("<strong class='text-red-300'>【高威力艦攻】</strong> 雷装値が高く、航空攻撃の威力に直結します。できるだけ大きいスロットに載せて撃墜による威力低下を防ぎましょう。");
            }
        }
        else if (type === '艦上爆撃機' || type.includes('艦爆')) {
            advice.push("<strong class='text-orange-300'>【戦爆連合CI】</strong> 艦攻と一緒に搭載すると「戦爆連合カットイン」が発動し、昼戦で強力な攻撃が可能になります。");
        }

        // --- 甲標的 ---
        else if (name.includes('甲標的')) {
            advice.push("<strong class='text-blue-400'>【先制雷撃】</strong> 雷巡、水母、一部の軽巡（矢矧、夕張、阿武隈など）に装備することで、戦闘開始前に強力な雷撃を行います。");
            advice.push("<strong class='text-yellow-300'>【注意】</strong> 装備するだけで先制雷撃が発動する非常に強力な装備。複数入手して各艦に持たせましょう。");
        }

        // --- 大発・対地系 ---
        else if (name.includes('大発動艇') || name.includes('特大発')) {
            advice.push("<strong class='text-green-400'>【遠征ボーナス】</strong> 遠征部隊に持たせることで、獲得資源が+5%（最大20%）増加します。");
            advice.push("<strong class='text-orange-400'>【対地特効】</strong> 陸上型の深海棲艦（ボス）に対して高いダメージボーナスを持ちます。");
            if (name.includes('陸戦隊') || name.includes('八九式')) {
                advice.push("<strong class='text-red-300'>【対地シナジー】</strong> 内火艇やWG42と組み合わせると対地ダメージが乗算的に跳ね上がります。");
            }
        }
        else if (name.includes('WG42') || name.includes('内火艇') || name.includes('二式内火艇')) {
            advice.push("<strong class='text-orange-400'>【対地特効シナジー】</strong> 陸上型の敵に対して必須です。大発動艇(陸戦隊)と複数組み合わせると相乗効果でとんでもない大ダメージが出ます。");
            if (name.includes('内火艇')) {
                advice.push("<strong class='text-red-300'>【最強の対地装備】</strong> 特に集積地棲姫に対して最高クラスの特効倍率を持ちます。改修すると更にダメージ倍率が上昇。");
            }
        }

        // --- 電探系 ---
        else if (type.includes('電探') || name.includes('電探') || name.includes('レーダー') || name.includes('RADAR')) {
            if (name.includes('対空') || (master.aa && master.aa >= 5)) {
                advice.push("<strong class='text-green-400'>【対空電探】</strong> 高角砲とセットで対空カットインのトリガーになります。また、艦隊防空値の底上げにも寄与します。");
            } else {
                advice.push("<strong class='text-yellow-400'>【水上電探】</strong> 索敵値（ルート分岐の条件）と命中率を同時に補強します。戦艦の弾着観測や駆逐のCI確率向上にも効果あり。");
            }
            if (level >= 1) advice.push(`<strong class='text-green-300'>【改修★${level}】</strong> 電探の改修は命中・索敵に√(★)ボーナス。索敵ラインがギリギリの海域で改修の差が効きます。`);
        }

        // --- ダメコン系 ---
        else if (name.includes('応急修理') || name.includes('ダメコン') || name.includes('女神')) {
            advice.push("<strong class='text-red-400'>【大破進撃可能】</strong> 大破状態で進撃すると轟沈を防ぎ、HP・弾薬を回復して戦闘を続行できます。イベントのボス前で使用する切り札。");
            if (name.includes('女神')) {
                advice.push("<strong class='text-yellow-400'>【女神】</strong> 発動時にHP全回復＋燃料弾薬も全回復。応急修理要員（穴ダメコン）より効果が大きいですが貴重品です。");
            }
        }

        // --- 増設バルジ・装甲系 ---
        else if (name.includes('バルジ') || name.includes('増設')) {
            advice.push("<strong class='text-cyan-300'>【追加装甲】</strong> 装甲値を底上げして被ダメージを軽減します。増設スロットに装備可能な中型バルジは駆逐艦の生存率を大きく向上させます。");
        }

        // --- 照明弾・夜偵など夜戦補助 ---
        else if (name.includes('照明弾')) {
            advice.push("<strong class='text-purple-300'>【夜戦補助】</strong> 夜戦開始時に発動し、味方の命中率UP＋敵のカットイン発動率DOWNの効果。夜戦主体の海域（5-3など）で特に重要。");
        }
        else if (name.includes('探照灯') || name.includes('サーチライト')) {
            advice.push("<strong class='text-purple-300'>【夜戦補助（被弾注意）】</strong> 装備艦に敵の攻撃が集中する代わりに、味方全体の夜戦命中・CI率が向上します。2番艦に装備して囮にするのが定石。");
        }

        // --- 煙幕 ---
        else if (name.includes('煙幕')) {
            advice.push("<strong class='text-cyan-400'>【煙幕回避】</strong> 戦闘開始時に使用すると艦隊全体の回避率が大幅に上昇。道中の被害を抑えたい海域で有効です。複数装備で効果UP。");
        }

        // --- 洋上補給 ---
        else if (name.includes('洋上補給')) {
            advice.push("<strong class='text-green-400'>【洋上補給】</strong> ボス戦前に使用すると弾薬ペナルティを回避。長いルート（5戦以上）の海域でボスへの与ダメージを確保するために不可欠。");
        }

        // ==========================================
        // 改修に関する共通アドバイス
        // ==========================================
        if (level >= 7 && advice.length > 0) {
            advice.push(`<strong class='text-yellow-200'>【高改修(★${level})】</strong> 十分に改修が進んでおり、隠しステータスボーナスが大きく乗っています。素晴らしい状態です。`);
        }

        // ==========================================
        // フォールバック
        // ==========================================
        if (advice.length === 0) {
            advice.push("【基本装備】 艦娘のステータスを底上げします。開発や改修を通じて、より上位の装備へ更新していくことが攻略の近道です。");
        }

        return advice;
    }
};
