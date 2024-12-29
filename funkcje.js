/**
 * różne funkcje 
 */

function jsDoSubmit(todoValue) {
    document.forma.todo.value = todoValue;
    document.forma.submit();
}

function jsDoSubmitSpin(elemId, todoValue) {
    $('#' + elemId).button('loading');
    document.forma.todo.value = elemId + '_click'; //todoValue;
    document.forma.submit();
}

function deleteRecord() {
    /*  if (confirm("Czy na pewno chcesz usunąć?")) {
            document.forma.todo.value = "delete";
            document.forma.submit();
        }*/
    bootbox.confirm("Usunąć - czy na pewno?", function(result) {
        if (result) {
            document.forma.todo.value = "delete";
            document.forma.submit();
        }
    });
}

function jsGoSearch() {
    jsDoSubmit('search');
}

function jsGoPageChange(newPageNr) {
    document.forma.page.value = newPageNr;
    jsDoSubmit('pageChange');
}

function jsAddNewClick() {
    jsDoSubmit('addNew');
}

function kolorOnGridRepeater(elem) {
    elem.className = elem.className + "Over";
}

function kolorOffGridRepeater(elem) {
    var s = elem.className;
    re = /Over/i;
    r = s.search(re);
    if (r > 0)
        elem.className = s.substr(0, r);
}

function jsRecordClick(recId, elemName) {
    document.forma.todo.value = 'recordClick';
    //document.forma.rog_id.value = recId;
    eval('document.forma.' + elemName + '.value = recId;');
    document.forma.submit();
}

function jsRecordClickEx(recId, elemName, actionValue) {
    document.forma.todo.value = actionValue;
    eval('document.forma.' + elemName + '.value = recId;');
    document.forma.submit();
}

function przecinekNaKropke(value) {
    re = /,/i;
    value = value.replace(re, ".");
    return value;
}

function stringNaFloat(value) {
    if (value == null || value == "")
        return 0;
    else {
        value = przecinekNaKropke(value);
        //alert(value);
        //alert("f: " + parseFloat(value));
        return parseFloat(value);
    }
}


// okienko modalne pokazaujące tekst za parametru i wykonujące submit z parametrem
function openConfirmModal(todoSubmitValue, confirmText) {
    $("#confirm-modal-text").html(confirmText);
    $("#confirm-modal-submit-btn").click(function() { jsDoSubmit(todoSubmitValue) });
    $("#confirmModal").modal();
}

// jscriptowy format yyyy-mm-dd
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// funkcja uruchamiana w przypadku błędu. Wysyła błąd do zapisu gdzieś na serwerze. W obecnej wersji do logów.
function showAndSaveError(functionName, dataToSend, errorInfo) {
    $.post("saveclienterror.php", {
        scriptName: window.location.pathname,
        functionName: functionName,
        sendData: JSON.stringify(dataToSend),
        error: errorInfo
    });
    alert("Przepraszamy, wystąpił błąd.");
}

// -------------- nowe funkcje ------------------

// wrzuca cały formularz do tablicy
function formToJson(forma) {
    var data2 = {};
    var data = $(forma).serializeArray();
    //console.log(data);
    data.forEach(function(elem) {
        data2[elem.name] = elem.value;
    });
    //console.log(data2);
    // // pola sterujące usuń
    // delete data['todo'];
    // delete data['back'];
    // delete data['page'];
    // delete data['sort'];
    return data2;
}

// wrzuca cały formularz do tablicy
function formToJson2(forma, data2) {
    var data = $(forma).serializeArray();
    data.forEach(function(elem) {
        data2[elem.name] = elem.value;
    });
    return data2;
}

// funkcja uruchamiana w przypadku błędu. Wysyła błąd do zapisu gdzieś na serwerze. W obecnej wersji do logów.
function postError(errInfo) {
    $.post("saveclienterror.php", {
        todo: 'saveClientError',
        filePath: window.location.pathname,
        errorInfo: errInfo
    });
    bootbox.alert("Błąd odczytu danych.<br>Możliwe, ze wygasła Twoja sesja - spróbuj zalogować się ponownie.", function() {});
}

// domyślna inicjalizacja VUE na stronie z listą rekordów. Porcjowarka, wyszukiwarka, przejście do szczegółów.

function vueDataDef() {
    return {
        dane: [],
        pageIndex: 1,
        portion: 10,
        returnedRows: 0,
        totalRows: 0,
        totalPages: 0,
    }
}

function vueFetchData(vueThisElem, fetchDataScript, loaderId = '', tableId = '') {
    var data = formToJson('#forma');
    data['todo'] = 'fetchData';
    data['pageIndex'] = vueThisElem.pageIndex;
    data['portion'] = vueThisElem.portion;

    if (loaderId != '') {
        $(loaderId).show();
        $(tableId).hide();
    }

    $.post(fetchDataScript, data, function(data) {
            if (data.result == 'OK') {
                vueApp.dane = data.data;
                vueApp.returnedRows = data.returnedRows;
                vueApp.totalRows = data.totalRows;
                vueApp.totalPages = parseInt(vueApp.totalRows / vueApp.portion);
                if (vueApp.totalRows % vueApp.portion > 0) {
                    vueApp.totalPages++;
                }
            } else {
                postError(JSON.stringify(data));
            }
            if (loaderId != '') {
                $(loaderId).hide();
                $(tableId).show();
            }
        }, "json")
        .fail(function(response) {
            postError(response.responseText);
            if (loaderId != '') {
                $(loaderId).hide();
                $(tableId).show();
            }
        });
}

function vuePoprzedniaStrona() {
    if (this.pageIndex > 1) {
        this.pageIndex--;
        this.fetchData();
    }
}

function vueNastepnaStrona() {
    if (this.pageIndex < this.totalPages) {
        this.pageIndex++;
        this.fetchData();
    }
}

function vueWybierzStrone(pageNo) {
    this.pageIndex = pageNo;
    this.fetchData();
}

function vueSearchData() {
    this.pageIndex = 1;
    this.fetchData();
}

// zmień statu przycisku na "loading..."
function showLoadingatButton(buttonId) {
    loadingButton = $(buttonId);
    loadingButton.button('loading');
}

// wyłącz "loading.. " na przycisku
function hideLoadingatButton() {
    if (typeof loadingButton !== 'undefined') {
        loadingButton.button('reset');
    }
}

// zapisz błąd do logu
function postErrorRt(response) {
    $.post("saveclienterror.php", {
        todo: 'saveClientError',
        filePath: window.location.pathname,
        errorInfo: response.responseText
    });
    bootbox.alert("Błąd odczytu/zapisu danych.", function() {});
    hideLoadingatButton();
}

// zapisz błąd do logu
function postErrorStf(data) {
    $.post("saveclienterror.php", {
        todo: 'saveClientError',
        filePath: window.location.pathname,
        errorInfo: JSON.stringify(data)
    });
    bootbox.alert("Błąd odczytu/zapisu danych.", function() {});
    hideLoadingatButton();
}

function dateCutYmd(dateString) {
    if (dateString == null || dateString == '') {
        return '';
    }
    return dateString.substr(0, 10);
}


const Csl_statusywnioskow_STA_DOAKCEPTACJI = '1';
const Csl_statusywnioskow_STA_ZAAKCEPTOWANY = '2';
const Csl_statusywnioskow_STA_ODRZUCONY = '3';
const Csl_statusywnioskow_STA_DOZATWIERDZENIA = '4';
const Csl_statusywnioskow_STA_ANULOWANY = '5';
const Csl_statusywnioskow_STA_DOZASTEPCY = '6';

// const Csl_statusywnioskow_STA_DOAKCEPTACJI = 1;
// const Csl_statusywnioskow_STA_ZAAKCEPTOWANY = 2;
// const Csl_statusywnioskow_STA_ODRZUCONY = 3;
// const Csl_statusywnioskow_STA_DOZATWIERDZENIA = 4;
// const Csl_statusywnioskow_STA_ANULOWANY = 5;
// const Csl_statusywnioskow_STA_DOZASTEPCY = 6;

function statusWnioskuLong(sta_id) {
    switch (sta_id.toString()) {
        case Csl_statusywnioskow_STA_DOAKCEPTACJI:
            return '<span class="label label-sm label-primary" title="do akceptacji"> do akceptacji </span>';
            break;
        case Csl_statusywnioskow_STA_ZAAKCEPTOWANY:
            return '<span class="label label-sm label-success" title="zaakceptowany"> zaakceptowany </span>';
            break;
        case Csl_statusywnioskow_STA_ODRZUCONY:
            return '<span class="label label-sm label-danger" title="odrzucony"> odrzucony </span>';
            break;
        case Csl_statusywnioskow_STA_DOZATWIERDZENIA:
            return '<span class="label label-sm label-info" title="do zatwierdzenia"> do zatwierdzenia </span>';
            break;
        case Csl_statusywnioskow_STA_ANULOWANY:
            return '<span class="label label-sm label-default" title="anulowany"> anulowany </span>';
            break;
        case Csl_statusywnioskow_STA_DOZASTEPCY:
            return '<span class="label label-sm label-default" title="do zastępcy"> do zastępcy </span>';
            break;
        default:
            return '<span class="label label-sm label-default"> - </span>';
    }
}

function statusWnioskuSmall(sta_id) {
    switch (sta_id.toString()) {
        case Csl_statusywnioskow_STA_DOAKCEPTACJI:
            return '<span class="label label-sm label-primary" title="do akceptacji"> do akcept. </span>';
            break;
        case Csl_statusywnioskow_STA_ZAAKCEPTOWANY:
            return '<span class="label label-sm label-success" title="zaakceptowany"> zaakcept. </span>';
            break;
        case Csl_statusywnioskow_STA_ODRZUCONY:
            return '<span class="label label-sm label-danger" title="odrzucony"> odrzuc. </span>';
            break;
        case Csl_statusywnioskow_STA_DOZATWIERDZENIA:
            return '<span class="label label-sm label-info" title="do zatwierdzenia"> do zatw. </span>';
            break;
        case Csl_statusywnioskow_STA_ANULOWANY:
            return '<span class="label label-sm label-default" title="anulowany"> anulowany </span>';
            break;
        case Csl_statusywnioskow_STA_DOZASTEPCY:
            return '<span class="label label-sm label-default" title="do zastępcy"> do zast. </span>';
            break;
        default:
            return '<span class="label label-sm label-default"> - </span>';
    }
}

// h, hh, h:mm, hh:mm
function rozbij_hhmm_naSkladowe(hh_mm, max_godzina = 23) {
    result = ['err', 0, 0]; // ok|err, hours, mins
    if (hh_mm == '') {
        return result;
    }
    godzina = 0;
    minuty = 0;
    posKropek = hh_mm.indexOf(':');
    if (posKropek == 0)
        return result;
    if (posKropek < 0) {
        godzina = hh_mm;
        if (isNaN(godzina))
            return result;
        godzina = parseInt(godzina, 10);
        if (godzina < 0 || godzina > max_godzina)
            return result;
    } else {
        godzina = hh_mm.substr(0, posKropek);
        if (posKropek + 1 + 2 > hh_mm.length)
            return result;
        minuty = hh_mm.substr(posKropek + 1, 2);
        if (isNaN(godzina) || isNaN(minuty))
            return result;
        godzina = parseInt(godzina, 10);
        minuty = parseInt(minuty, 10);
        if (godzina < 0 || minuty < 0 || godzina > max_godzina || minuty > 59)
            return result;
    }

    result = ['ok', godzina, minuty];

    return result;
}

// inuput: h, hh, h:mm, hh:mm
// output: przeliczone na minuty lub string "err"
function hmNaMinuty(value) {
    if (value == null || value == '') {
        return 0;
    }
    var hm = rozbij_hhmm_naSkladowe(value);
    if (hm[0] != 'ok') {
        return 'err';
    }
    return hm[1] * 60 + hm[2];
}


function showGodzinMinut(godzin, minut) {
    var result = '';
    if (godzin != null) {
        result = godzin;
    }
    if (minut != null) {
        if (result == '') {
            result = '0';
        }
        result += ':' + minut.toString().padStart(2, '0');
    }
    return result;
}

function showGodzinMintFromMinut(minut, alwaysShowMinutes = true) {
    if (minut == null || minut == '') {
        return '';
    }
    var znak = '';
    if (minut < 0) {
        znak = '-';
        minut = minut * (-1);
    }
    godzinWMinutach = Math.floor(minut / 60);
    resztaMinut = minut - godzinWMinutach * 60;
    if (resztaMinut == 0 && !alwaysShowMinutes) {
        resztaMinut = null;
    }
    return znak + showGodzinMinut(godzinWMinutach, resztaMinut);
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function dateTimeNoSec(val) {
    if (val == null || val == '') {
        return ''
    }
    return val.substr(0, 16);
}

function policzRozniceGodzin(godzOd, godzDo) {    
    let godzin = '';
    let minut = '';
    var dateOd = new Date("2020-06-15 " + godzOd);
    var dateDo = new Date("2020-06-15 " + godzDo);		
    if (isNaN(dateDo) || isNaN(dateDo)) {
        return {'godzin': '', 'minut': '', 'hhmm': ''};
    } else {
        var diffMs = (dateDo - dateOd);
        if (diffMs >= 0) {
            // jeśli harmonogram 8-16
            godzin =  Math.floor((diffMs % 86400000) / 3600000); // hours
            minut = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes                
        } else {
            // jeśli harmonogram 22-04 (druga zmiana) to dodaj 1 dzień, bo 4:00 jest już następnego dnia
            dateDo.setDate(dateDo.getDate() + 1); // dodaj 1 dzień
            diffMs = (dateDo - dateOd);
            godzin =  Math.floor((diffMs % 86400000) / 3600000); // hours
            minut = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes                
        }
    }
    return {'godzin': godzin, 'minut': minut, 'hhmm': showGodzinMinut(godzin, minut)};
}

function policzRozniceDni(dataOd, dataDo) {    
    var dateOd = new Date(dataOd);
    var dateDo = new Date(dataDo);		
    if (isNaN(dateDo) || isNaN(dateDo)) {
        return '';
    }

    // var diffTime = Math.abs(dateDo - dateOd);
    var diffTime = dateDo - dateOd;
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    return diffDays;
}

function odmianaDzienDni(odmiany, ilosc){ // $odmiany = Array('jeden','dwa','pięć')
    var txt = odmiany[2];
    ilosc = ilosc + '';
    if (ilosc == '1') return odmiany[0];
    //jednosci = (int) substr(ilosc,-1);
    jednosci = ilosc.slice(ilosc.length - 1);
    // jednosci = ilosc.substr(ilosc.length - 1);
    reszta = ilosc % 100;
    if ((jednosci > 1 && jednosci < 5) &! (reszta > 10 && reszta < 20))
      txt = odmiany[1];
    return txt;
  }


  const CSl_statusy_delegacji_STATUS_ROBOCZA = '1';
  const CSl_statusy_delegacji_STATUS_DO_AKCEPTACJI = '2';
  const CSl_statusy_delegacji_STATUS_ZAAKCEPTOWANA = '3';
  const CSl_statusy_delegacji_STATUS_ODRZUCONA = '4';
  const CSl_statusy_delegacji_STATUS_ZATWIERDZONA = '5';
  const CSl_statusy_delegacji_STATUS_NIEZATWIERDZONA = '6';
  const CSl_statusy_delegacji_STATUS_SZABLON = '7';
  const CSl_statusy_delegacji_STATUS_SZABLON_UDOSTEPNIONY = '8';
  const CSl_statusy_delegacji_STATUS_DO_WYPLATY = '9';
  const CSl_statusy_delegacji_STATUS_WYPLACONA = '10';
  const CSl_statusy_delegacji_STATUS_DO_AKCEPT_KSIEG = '11';
  const CSl_statusy_delegacji_STATUS_ZAAKCEPT_KSIEG = '12';
  const CSl_statusy_delegacji_STATUS_ZAAKCEPT_FINANS = '13';

  function statusDelegacji(std_id) {
    switch (std_id.toString()) {
        case CSl_statusy_delegacji_STATUS_DO_AKCEPTACJI:
            return '<span class="label label-sm label-primary" title="do akceptacji"> do akcept. </span>';
            break;
        case CSl_statusy_delegacji_STATUS_ZAAKCEPTOWANA:
            return '<span class="label label-sm label-success" title="zaakceptowana"> zaakcept. </span>';
            break;
        case CSl_statusy_delegacji_STATUS_ZATWIERDZONA:
            return '<span class="label label-sm label-success" title="zatwierdzona" style="background-color:#358f89"> zatwierdz. </span>';
            break;
        case CSl_statusy_delegacji_STATUS_ODRZUCONA:
            return '<span class="label label-sm label-danger" title="odrzucona"> odrzuc. </span>';
            break;
        case CSl_statusy_delegacji_STATUS_NIEZATWIERDZONA:
            return '<span class="label label-sm label-danger" title="odrzucona"> odrzuc. </span>';
            break;
        case CSl_statusy_delegacji_STATUS_ROBOCZA:
            return '<span class="label label-sm label-default" title="robocza"> robocza </span>';
            break;
        case CSl_statusy_delegacji_STATUS_ROBOCZA:
            return '<span class="label label-sm label-default" title="robocza"> robocza </span>';
            break;
        case CSl_statusy_delegacji_STATUS_SZABLON:
            return '<span class="label label-sm label-default"> szablon </span>';
            break;
        case CSl_statusy_delegacji_STATUS_SZABLON_UDOSTEPNIONY:
            return '<span class="label label-sm label-default" title="szablon udostępniony"> udostępn. </span>';
            break;
        case CSl_statusy_delegacji_STATUS_DO_WYPLATY:
            return '<span class="label label-sm label-warning"> do wypłaty </span>';
            break;
        case CSl_statusy_delegacji_STATUS_WYPLACONA:
            return '<span class="label label-sm label-info"> wypłacona </span>';
            break;
        case CSl_statusy_delegacji_STATUS_DO_AKCEPT_KSIEG:
            return '<span class="label label-sm label-primary" title="do akceptacji księgowej"> do akc. ksg. </span>';
            break;
        case CSl_statusy_delegacji_STATUS_ZAAKCEPT_KSIEG:
            return '<span class="label label-sm label-primary" title="zaakceptowano księgowo"> zaakc. ksg. </span>';
            break;
        case CSl_statusy_delegacji_STATUS_ZAAKCEPT_FINANS:
            return '<span class="label label-sm label-primary" title="zaakceptowano finansowo"> zaakc. fin. </span>';
            break;
        default:
            return '<span class="label label-sm label-default"> - </span>';
    }
}

function ifNotEmptyAndNotInteger(value) {
    return value != null && value != '' && parseInt(value) != value;
}


function ifNotEmptyAndNotEmail(value) {
    return value != null && value != '' && (value.indexOf("@") == -1 || value.indexOf(".") == -1 || value.indexOf(' ') > -1);
}

function sumaGodzMin(iloscGodzin1, iloscMinut1, iloscGodzin2, iloscMinut2) {
    var h = iloscGodzin1 + iloscGodzin2;
    var m = iloscMinut1 + iloscMinut2;

    var godzinWMinutach = Math.floor(m / 60);
    m = m - godzinWMinutach * 60;
    h += godzinWMinutach;
    return [h, m];
}

function formatCurrency(value, postfix, miejscDziesietnych = 2) {
    if (value == null || value == '') {
        return '';
    }
    // var n = 2; // miejsc dziesiętnych
    var n = miejscDziesietnych;
    var x = 3; // całkowite
    var s = ' ' // separator tysięcy
    var c = ',' // separator dziesiętnych
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
    num = parseFloat(value).toFixed(Math.max(0, ~~n));
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ',')) + ' ' + postfix;
}

function isLiczbaCalkowita(wartosc, czyMozeBycPuste) {
    if (wartosc == null || wartosc == undefined || wartosc == '') {
        if (czyMozeBycPuste) {
            return true;
        }        
        return false;
    }
    ok = 1;
    for (i = 0; i < wartosc.length; i++)
        if (isNaN(wartosc.charAt(i)) || wartosc.charAt(i) == " ")
            ok = 0;
    if (ok == 1) {
        return true;
    }    
    return false;
}

function isEmpty(value) {
    if (value == undefined || value == null || value == '') {
        return true;
    }
    return false;
}

function kropkaNaPrzecinek(value) {
    if (isEmpty(value)) {
        return '';
    }
    value = String(value);
    return value.replace('.', ',');
}

function opentabIndexToInt(strValue) {
    switch (strValue) {
        case 'TAB_PW_PRZYCHODZ': return 1; break;
        case 'TAB_PW_PRZEKAZANE': return 2; break;
        case 'TAB_PW_W_REALIZACJI': return 3; break;
        case 'TAB_PW_ZAKONCZONE': return 4; break;
        case 'TAB_PW_WSZYSTKIE': return 5; break;
    }
    return 0;    
}

function newDateFromDataGodzinaSafari(data, godzina) {
    // bład Safari, to 2020-06-15 9:00 jest błędne, powinno być 09:00 - stąd ta funkcja
    var arrHHmm = godzina.split(/:/);
    var arrYmd = data.split(/-/);
    return new Date(arrYmd[0], arrYmd[1], arrYmd[2], arrHHmm[0], arrHHmm[1]);
}

function numerMiesiacaNaText(nrMiesiaca) {
	if (nrMiesiaca == undefined || nrMiesiaca == '') {
		return '';
	}
	nrMiesiaca = parseInt(nrMiesiaca);
	if (nrMiesiaca < 1 || nrMiesiaca > 12) {
		return '';
	}	
	var miesiace = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];
	return miesiace[nrMiesiaca - 1];
}

function reloadPageIfEnterByGoBackInBrowser() {
    if (window.performance.getEntriesByType("navigation")[0].type === "back_forward") {
        window.location.reload();
    }
}

function zeroIfEmpty(value) {
    if (value == null || value == '') {
        return 0;
    }
    return value;
}

function showQRcodeUsera() {
    $('#imgKoduPracownika').attr('src', 'my-qrcode.php?todo=showmyqrcode');
    $('#modalShowMyQRcode').modal('show');
}

function policzRozniceMinut(godz_od, godz_do) {
    arrOdHm = godz_od.split(/:/);
    arrDoHm = godz_do.split(/:/);
    var dateOd = new Date(2020, 5, 15, arrOdHm[0], arrOdHm[1]);
    var dateDo = new Date(2020, 5, 15, arrDoHm[0], arrDoHm[1]);
    if (isNaN(dateDo) || isNaN(dateOd)) {
        return null;
    }
    var diffMs = dateDo - dateOd;
    
    minutRoznicy =  Math.floor(diffMs/1000/60); // minutes
    return minutRoznicy;
}