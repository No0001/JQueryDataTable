using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DataTableSample.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult AjaxGetList(string keyword, int keyword2)
        {
            var datas = new List<object>();

            for (int i = 0; i < 20; i++)
            {
                datas.Add(new { id = i.ToString() , Name = "test"});
            }
            return Json(new
            {
                data = datas,
                IsSuccess = true,

            }, JsonRequestBehavior.AllowGet);
        }

    }
}